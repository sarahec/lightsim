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
import makeMatchFn, { MatchFn, type MatcherType } from './util/matcher.js';

import remarkDirective from "remark-directive";
import remarkFrontmatter from "remark-frontmatter";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { VFile } from "vfile";
import parseDirective from "./directives.js";

export type MetadataScope = 'global' | 'page';

/**
 * Options for the metadata plugin.
 * @property isTarget A function that returns true if a node is a heading that should be used to locate metadata
 * @property isMetadata A function that returns true if a node should be included as metadata
 * @property log A logger (optional)
 */
export type MetadataOptions = {
  readonly isTarget?: MatcherType;
  readonly isMetadata?: MatcherType;
  readonly log?: Logger<ILogObj>;
}

/**
 * A single page with its content root, topmost heading, and metadata.
 */
export type PageRecord = {
  root: Root;
  heading: Heading;
  metadata: Metadata;
}

/**
 * All of the pages found in the source (with their metadata) plus the global metadata.
 */
export type PageCollection = {
  frontmatter?: Metadata;
  pages: PageRecord[];
};

// Syntactic sugar for accessing the metadata
interface Root extends MdastRoot {
  meta?: Record<string, string>;
}

// Syntactic sugar for accessing the metadata
interface Node extends UnistNode {
  meta?: Record<string, string>;
}

const LOGGER_NAME = 'precompile';

/**
 * Parse a source file and return a list of pages with their metadata (also the global metadata).
 * @param source the Markdown source file with special annotations
 * @param options Processing options (optional)
 * @returns a PageCollection containing the global metadata and a list of pages with their metadata
 */

export default function precompile(source: VFile, options: MetadataOptions = {}): PageCollection {
  const log =
    options?.log?.getSubLogger({ name: LOGGER_NAME }) ??
    new Logger({ name: LOGGER_NAME, minLevel: 3 });
  const matchDirectives = makeMatchFn(options?.isMetadata ?? 'leafDirective');
  const matchDestination = makeMatchFn(options?.isTarget ?? 'heading');

  const tree = parseWithMetadata(source);
  const orderedNodes: ScannedNode[] = collectNodesOfInterest(tree, matchDirectives, matchDestination, log);
  const globalMetadata = extractGlobalMetadata(orderedNodes);
  const pages = collectPageRoots(orderedNodes, log);
  dropMetadataNodes(orderedNodes); // from the tree
  attachPageBodies(pages, tree, log);

  return { frontmatter: globalMetadata, pages: pages };
};

/**
 * Calls the remark parser with Frontmatter and Directives extensions.
 * Exported for testing.
 * 
 * @param source 
 * @returns 
 */
export function parseWithMetadata(source: VFile) {
  return unified()
    .use(remarkParse)
    .use(remarkFrontmatter, ['yaml'])
    .use(remarkDirective)
    .parse(source) as unknown as Root;
}

type ScannedNode = {
  node: Node;
  parents: Parent[];
};


/**
 * Find all of the metadata and heading nodes (that match the heading rules) in the tree and 
 * return them in source order.
 * 
 * @param tree the tree to be scanned
 * @param options used for the `isMetadata` and `isTarget` functions.
 * @returns an array of nodes with their parents
 */
export function collectNodesOfInterest(tree: Root, matchDestination: MatchFn, matchDirectives: MatchFn, log?: Logger<ILogObj>): ScannedNode[] {
  const typeTest: Test = (probe: Node) => ['leafDirective', 'heading', 'yaml'].includes(probe.type);

  const orderedNodes: ScannedNode[] = [];

  const visitor: Visitor = (node: Node, parents: Node[]) => {
    if (node.type === 'yaml' || matchDirectives(node) || matchDestination(node)) {
      orderedNodes.push({ node: node, parents: [...parents] as Parent[] });
      return SKIP;
    }
    return CONTINUE;
  };

  // Walk the tree and collect all the nodes we care about
  visitParents(tree, typeTest, visitor);

  return orderedNodes;
}

/**
 * Find all the global metadata nodes in the tree and return them as a single object.
 * 
 * Currently this involves finding frontmatter YAML and parsing it (via the `load` function from `js-yaml`).
 * 
 * @param orderedNodes a source-order list of nodes with their parents
 * @returns an Object containing the combined global metadata
 */
export function extractGlobalMetadata(orderedNodes: ScannedNode[]): Metadata | undefined {
  // @ts-expect-error 'value' will exist, the output of `load` is a `Record<string, unknown> | undefined`
  return orderedNodes.filter((probe) => probe.node.type === 'yaml').reduce((acc, probe) => { return { ...acc, ...(load(probe.node['value'])) } }, {});
}

/**
 * Using the result of the node scan, extract the headings into a list of page roots and attach 
 * any directive-based metadata.
 * @param orderedNodes an array of nodes with their parents
 * @param log for logging
 * @returns a lst of pages with their root nodes and metadata.
 */
export function collectPageRoots(orderedNodes: ScannedNode[], log?: Logger<ILogObj>): PageRecord[] {
  // Each target heading should be followed by its metadata (`leafDirective` nodes)
  // and then the next heading (or the end of the list)
  const pages: PageRecord[] = [];

  for (const probe of orderedNodes) {
    let page: PageRecord | undefined;
    switch (probe.node.type) {
      case 'heading': {
        page = { heading: probe.node as Heading, root: { type: 'root', children: [probe.node] } as Root, metadata: {} };
        pages.push(page);
      } break;
      case 'leafDirective': {
        if (!page) {
          log?.warn(`Found metadata without a heading at ${probe.node.position?.start?.line}`);;
        } else {
          const metadata = parseDirective(probe.node);
          page.metadata = { ...page.metadata, ...metadata };
        }
      } break;
      case 'yaml':
        // skip
        break;
      default:
        log?.debug(`Unexpected node type in metadata processing ${probe.node.type}`);
    }
  }
  return pages;
}

/**
 * Drops the metadata nodes from the tree.
 * (The scanned nodes are pointers into the tree, so this will modify the tree.)
 * 
 * @param orderedNodes a list of metadata and heading nodes with their parents
 */
function dropMetadataNodes(orderedNodes: ScannedNode[]) {
  for (const probe of orderedNodes.reverse()) {
    if (probe.node.type === 'heading') continue;
    // @ts-expect-error `probe.node` is a perfectly fine thing to search for
    probe.parents[0].children.splice(probe.parents[0].children.indexOf(probe.node), 1);
  }
}

/**
 * For each page, find the next heading and splice all the nodes between the current heading (inclusive) and the next heading into the page's root
 * @param pages page records
 * @param tree source tree
 * @param log for logging
 */
function attachPageBodies(pages: PageRecord[], tree: Root, log: Logger<ILogObj>) {
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
}
