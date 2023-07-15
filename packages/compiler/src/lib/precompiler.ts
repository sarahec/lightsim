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
import { load } from "js-yaml";
import { Heading, Root as MdastRoot, Parent } from 'mdast';
import { ILogObj, Logger } from 'tslog';
import { Node as UnistNode } from "unist";
import { CONTINUE, SKIP, Test, Visitor, visitParents } from "unist-util-visit-parents";
import makeMatchFn, { type MatcherType } from './util/matcher.js';

import { current } from "immer";
import remarkDirective from "remark-directive";
import remarkFrontmatter from "remark-frontmatter";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { VFile } from "vfile";
import parseDirective from "./directives.js";


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

export type PageRecord = {
  root: Root;
  heading: Heading;
  metadata: Metadata;
}

export type PageCollection = {
  frontmatter?: Metadata;
  pages: PageRecord[];
};

// Syntactic sugar for accessing the metadata
interface Root extends MdastRoot {
  meta?: Record<string, string>;
}

interface Node extends UnistNode {
  meta?: Record<string, string>;
}

const LOGGER_NAME = 'precompile';

export default function precompile(source: VFile, options: MetadataOptions = {}) {

  const log =
    options?.log?.getSubLogger({ name: LOGGER_NAME }) ??
    new Logger({ name: LOGGER_NAME, minLevel: 3 });

  const rawAST = unified().use(remarkParse).use([remarkFrontmatter, remarkDirective]).parse(source);
  return scanTree(rawAST as Root, log, options);
};

type ScannedNode = {
  node: Node;
  parents: Parent[];
};

export function scanTree(tree: Root, log: Logger<ILogObj>, options: MetadataOptions = {}): PageCollection {
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


  // Now begin processing the collection of nodes

  // @ts-expect-error 'value' will exist, the output of `load` is a `Record<string, unknown> | undefined`
  const globalMetadata = orderedNodes.filter((probe) => probe.node.type === 'yaml').reduce((acc, probe) => { return { ...acc, ...(load(probe.node['value'])) } }, {});

  // 
  // Each target heading should be followed by its metadata (`leafDirective` nodes)
  // and then the next heading (or the end of the list)

  for (const probe of orderedNodes) {
    let page: PageRecord | undefined;
    switch (probe.node.type) {
      case 'heading': {
        page = { heading: probe.node as Heading, root: { type: 'root', children: [probe.node] } as Root, metadata: {} };
        pages.push(page);
      } break;
      case 'leafDirective': {
        if (!page) {
          log.warn(`Found metadata without a heading at ${probe.node.position?.start?.line}`);;
        } else {
          const metadata = parseDirective(probe.node);
          page.metadata = { ...page.metadata, ...metadata };
        }
      } break;
      case 'yaml':
        // skip
        break;
      default:
        log.debug(`Unexpected node type in metadata processing ${probe.node.type}`);
    }
  }

  // Remove the metada nodes from the tree
  for (const probe of orderedNodes.reverse()) {
    if (probe.node.type === 'heading') continue;
    // @ts-expect-error `probe.node` is a perfectly fine thing to search for
    probe.parents[0].children.splice(probe.parents[0].children.indexOf(probe.node), 1);
  }

  // Iterate the pages.
  // For each page, find the next heading and splice all the nodes between the current heading (inclusive) and the next heading into the page's root
  for (const page of pages) {
    const heading = page.heading;
    const headingIndex = tree.children.indexOf(heading);
    if (headingIndex == -1) {
      log.warn(`Could not find heading ${heading} in tree`); // Assumption: All headings are the direct child of root
      continue;
    }
    const nextHeadingIndex = tree.children.slice(headingIndex + 1).findIndex((probe) => probe.type === 'heading');
    if (nextHeadingIndex >= 0) {
      page.root.children.push(...tree.children.slice(headingIndex + 1, nextHeadingIndex + headingIndex + 1));
    } else {
      page.root.children.push(...tree.children.slice(headingIndex + 1));
    }
  }

  return { frontmatter: globalMetadata, pages: pages };
}
