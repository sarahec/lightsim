/*
 Copyright 2023 Sarah Clark

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      https://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

import { Metadata } from "@lightsim/runtime";
import { produce } from "immer";
import { load } from "js-yaml";
import { Root as MdastRoot } from 'mdast';
import { ILogObj, Logger } from 'tslog';
import { Node as UnistNode } from "unist";
import find, { findAll } from "./util/find.js";
import makeMatchFn, { type MatcherType } from './util/matcher.js';

/**
 * Returns true if this node should be included as metadata.
 * @param name The name of the metadata property
 * @param value The value of the metadata property
 * @param node The node (a directive) containing the metadata
 */
export type MetadataFilter = (node: Node, name?: string, value?: object,) => boolean;

export type MetadataScope = 'global' | 'page';

export type MetadataOptions = {
  readonly directivesLocation?: MatcherType;
  readonly filter?: MetadataFilter;
  readonly log?: Logger<ILogObj>;
}

// Syntactic sugar for accessing the metadata
interface Root extends MdastRoot {
  meta?: Record<string, string>;
}

interface Node extends UnistNode {
  meta?: Record<string, string>;
}

const LOGGER_NAME = 'metadata';

/** @type {import('unified').Plugin<[Options]>} */
export function hoistMetadata(options: MetadataOptions = {}) {

  const log =
    options?.log?.getSubLogger({ name: LOGGER_NAME }) ??
    new Logger({ name: LOGGER_NAME, minLevel: 3 });

  const settings = {
    directivesLocation: matchHeadings,
    filter: (node: Node) => node.type === 'textDirective',
    ...options
  };

  // @ts-expect-error missing name or attributes will just come up undefined, which is fine
  const matchDirectives = (node: Node) => settings.filter(node, node.name, node.attributes);
  const matchLocation = makeMatchFn(settings.directivesLocation);


  function matchHeadings(node: Node): boolean {
    // @ts-expect-error this node should have a depth if it's a heading
    return node.type === 'heading' && node.depth <= 2;
  };

  // Parse the frontmatter (type: 'yaml') and add it to the root as `meta`
  function hoistFrontmatter(tree: Root): Root {
    const path = find(tree, 'yaml');
    if (path) {
      path.remove();
      // @ts-expect-error this node has a value
      const yaml = load(path?.node?.value);
      // @ts-expect-error we can add any property to a node
      tree.meta = { scope: 'global', ...yaml };
      log.trace('Parsed frontmatter and attached to root');
    }
    return tree;
  }

  function hoistDirectives(tree: Root): Root {
    for (const directive of findAll(tree, matchDirectives)) {
      const log = options?.log?.getSubLogger({ name: LOGGER_NAME }) ??
        new Logger({ name: LOGGER_NAME, minLevel: 3 });

      if (!directive) break;
      // @ts-expect-error name exists
      log.trace(`Found directive: ${directive.node.name}`);
      const probe = directive.findBefore(matchLocation);
      if (probe) {
        directive.remove();
        const destination = probe.node as Node;
        destination.meta ||= { scope: 'page' };
        // @ts-expect-error these attributes also exist
        destination.meta[directive.node.name] = directive.node.attributes;
      }

    }
    return tree;
  }

  return (tree: Root) => produce(tree, (draft) => {
    hoistFrontmatter(draft);
    hoistDirectives(draft);
  });

};

export function extractMetadata(tree: Root, scope: MetadataScope, log?: Logger<ILogObj>): Metadata | undefined {
  const LOGGER_NAME = 'extract metadata';
  const _log = log?.getSubLogger({ name: LOGGER_NAME }) ??
    new Logger({ name: LOGGER_NAME, minLevel: 3 });

  // @ts-expect-error TS wants `.scope` to be ['scope'] but that's no possible when meta is optional
  const location = find(tree, (probe) => (probe as Node).meta?.scope === scope);
  if (!location) return undefined;
  // @ts-expect-error location.node is a generic node (not our sugared type)
  const metadata = { ...location?.node?.meta };
  if (metadata.scope) delete metadata.scope;
  _log.trace(`Found metadata: ${JSON.stringify(metadata)}`);
  return metadata as Metadata;
}
