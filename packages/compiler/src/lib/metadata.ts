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
import { Root as MdastRoot, Parent } from 'mdast';
import { ILogObj, Logger } from 'tslog';
import { Node as UnistNode } from "unist";
import find, { findAll } from "./util/find.js";
import makeMatchFn, { type MatcherType } from './util/matcher.js';
import { CONTINUE, SKIP, Test, Visitor, visitParents } from "unist-util-visit-parents";

export type MetadataScope = 'global' | 'page';

/**
 * Options for the metadata plugin.
 * @property directivesLocation A function that returns true if a node is a heading that should be used to locate metadata
 * @property filter A function that returns true if a node should be included as metadata
 * @property log A logger (optional)
 */
export type MetadataOptions = {
  readonly isTarget?: MatcherType;
  readonly isMetadata?: MatcherType;
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
    filter: (node: Node) => node.type === 'leafDirective',
    ...options
  };

  function matchHeadings(node: Node): boolean {
    // @ts-expect-error this node should have a depth if it's a heading
    return node.type === 'heading' && node.depth <= 2;
  };

  return (tree: Root) => {
    // console.log("Before hoisting: ", JSON.stringify(tree, null, 2)); // <<<
    const result = produce(tree, (draft) => {
      hoistFrontmatter(draft, log);
      hoistDirectives(draft, settings.isMetadata, settings.isTarget, log);
    });
    // console.log("After hoisting: ", JSON.stringify(result, null, 2)); // <<<
    return result;
  }
};

/**
 * Parse the frontmatter (type: 'yaml') and add it to the root as `meta`.
 * @param tree The AST that has been parsed with RemarkFrontmatter
 * @param log A logger (optional)
 **/
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function hoistFrontmatter(tree: Root, log?: Logger<any>): Root {
  const path = find(tree, 'yaml');
  if (path) {
    path.remove();
    // @ts-expect-error this node has a value
    const yaml = load(path?.node?.value);
    // @ts-expect-error we can add any property to a node
    tree.meta = { scope: 'global', ...yaml };
    log?.trace('Parsed frontmatter and attached to root');
  }
  return tree;
}

/**
 * Parse the directive nodes and add it to the closest section above as `meta`.
 * 
 * Note: This is exposed for testing purposes.
 * 
 * @param tree The AST that has been parsed with Remark Frontmatter
 * @param directivesPattern Matches directive nodes. Default: `leafDirective`
 * @param destinationPattern Matches destination nodes. Default: `heading`
 * @param log A logger (optional)
 **/

export function hoistDirectives(tree: Root, directivesPattern?: MatcherType,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  destinationPattern?: MatcherType, log?: Logger<any>): Root {
  const matchDirectives = makeMatchFn(directivesPattern ?? 'leafDirective');
  const matchDestination = makeMatchFn(destinationPattern ?? 'heading');
  const matchEither = (probe: Node) => matchDirectives(probe) || matchDestination(probe);

  let target: Node = tree;
  let scope: MetadataScope = 'global';
  let metadata: Metadata = {};

  log?.silly(`hoistDirectives: ${JSON.stringify(tree)}`); /// <<<
  for (const findResult of findAll(tree, matchEither)) {
    if (!findResult || !findResult.node) {
      log?.trace(`No directives found`);
      return tree;
    }
    if (findResult.node.type === 'heading') {   // We've found a new section
      if (metadata[scope]) {
        // Copy to current target
        target.meta = { ...target.meta, ...metadata };
      }
      target = findResult.node;
      metadata = {};
      scope = 'page';
      continue;
    } else if (findResult.node.type === 'leafDirective') {
      const directive = findResult.node;
      const _metadata = parseDirective(directive, log);
      if (!_metadata) {
        log?.warn(`could not parse directive ${JSON.stringify(directive)}`);
      } else {
        metadata = { ...metadata, ..._metadata, scope: scope };
        log?.trace(`Parsed directive ${JSON.stringify(directive)} into ${JSON.stringify(metadata)}`);
        findResult.remove();
      }
    } else {
      log?.warn(`Unexpected node type ${findResult.node.type}`);
    }
  }
  if (target && metadata[scope]) {
    // Copy to current target
    target.meta = { ...target.meta, ...metadata };
  }
  return tree;
}

/**
 * 
 * @param tree Utility function to read the metadata at a particular scope
 * @param scope A scope string (e.g. 'global' or 'page')
 * @param log Logger (optional)
 * @returns a metadata object or undefined if no metadata was found
 */
export function extractMetadata(tree: Root, scope: MetadataScope, log?: Logger<ILogObj>) {
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

/**
 * Parse a directive node into a metadata object.
 * @param node The directive node
 * @param log A logger (optional)
 * @returns a metadata object or undefined if no metadata was found
 */
export function parseDirective(node: Node, log?: Logger<ILogObj>) {
  const LOGGER_NAME = 'parse directive';
  const _log = log?.getSubLogger({ name: LOGGER_NAME }) ??
    new Logger({ name: LOGGER_NAME, minLevel: 3 });

  _log.trace(`Directive: ${JSON.stringify(node)}`);

  if (node.type != 'leafDirective') {
    _log.error(`Node is not a directive: ${JSON.stringify(node)}`);
    return undefined;
  }
  _log.trace(`Parsing directive: ${node.type}`);
  const text = find(node, 'text');
  if (!text) {
    _log.error(`Directive has no text: ${JSON.stringify(node)}`);
    return undefined;
  }
  // console.log("Text directive: ", JSON.stringify(node)); // <<<
  // @ts-expect-error text node has a value and a leafDirective has a name
  return { [node.name]: text.node.value };
}

export type PageRecord = {
  num: number;
  root: Node;
  metadata: Metadata;
}

type ScanResult = {
  frontmatter?: Metadata;
  pages: PageRecord[];
};

type ScannedNode = {
  node: Node;
  parents: Parent[];
};

export function scanTree(tree: Root, log: Logger<undefined>, options: MetadataOptions = {}): ScanResult {
  const typeTest: Test = (probe: Node) => ['leafDirective', 'heading', 'yaml'].includes(probe.type);
  const matchDirectives = makeMatchFn(options?.isMetadata ?? 'leafDirective');
  const matchDestination = makeMatchFn(options?.isTarget ?? 'heading');

  const orderedNodes: ScannedNode[] = [];
  const pages: PageRecord[] = [];

  const visitor: Visitor = (node: Node, parents: Node[]) => {
    if (node.type === 'yaml' || matchDirectives(node) || matchDestination(node)) {
      orderedNodes.push({ node: node, parents: [...parents] as Parent[] });
      return SKIP
    }
    return CONTINUE;
  }

  // Walk the tree and collect all the nodes we care about
  visitParents(tree, typeTest, visitor);
  // @ts-expect-error 'value' will exist, the output of `load` is a `Record<string, unknown> | undefined`
  const globalMetadata = orderedNodes.filter((probe) => probe.node.type === 'yaml').reduce((acc, probe) => { return { ...acc, ...(load(probe.node['value'])) } }, {});
  if (globalMetadata) {
    pages.push({ num: 0, root: tree, metadata: globalMetadata });
  }

  // Each target heading should be followed by its metadata (`leafDirective` nodes)
  // and then the next heading.
  for (const probe of orderedNodes) {
    switch (probe.node.type) {
      case 'heading': {
        const page = { num: pages.length, root: probe.node, metadata: { scope: 'page' } };
        pages.push(page);
      }
        break;
      case 'leafDirective': {
        const metadata = parseDirective(probe.node);
        if (metadata) {
          pages[pages.length - 1].metadata = { ...pages[pages.length - 1].metadata, ...metadata };
        }
      }
        break;
      case 'yaml':
        // skip
        break;
      default:
        log.debug(`Unexpected node type in metadata processing ${probe.node.type}`);
    }
  }

  // Merge the metadata onto the target nodes
  for (const page of pages) {
    page.root.meta = { ...page.root.meta, ...page.metadata };
  }

  // Remove the metada nodes from the tree
  for (const probe of orderedNodes.reverse()) {
    if (probe.node.type === 'heading') continue;
    // @ts-expect-error `probe.node` is a perfectly fine thing to search for
    probe.parents[0].children.splice(probe.parents[0].children.indexOf(probe.node), 1);
  }

  return { frontmatter: globalMetadata, pages: pages };
}
