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

import { type CompiledSimulation } from '@lightsim/runtime';
import { freeze } from 'immer';
import { Root } from 'mdast';
import remarkDirective from "remark-directive";
import remarkFrontmatter from "remark-frontmatter";
import remarkParse from 'remark-parse';
import { ILogObj, Logger } from 'tslog';
import { unified } from 'unified';
import { VFile } from 'vfile';
import freezeTree from './freezeTree.js';
import groupNodes, { type NodeGroupingOptions } from './groupNodes.js';
import { extractMetadata, hoistMetadata } from './metadata.js';
import render, { type RenderOptions } from './render.js';
import splitTrees, { type SplitOptions } from './split-trees.js';

const LOGGER_NAME = 'compiler';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export type CompileOptions = {
  readonly group?: NodeGroupingOptions;
  readonly split?: SplitOptions;
  readonly render?: RenderOptions;
  readonly singlePage?: boolean;
  readonly log?: Logger<ILogObj>;
}

/**
 * Compiles and formats a list of VFiles.
 *
 * @param source A single markdown page
 * @param options Options for the compiler
 * @param logger A parent logger or or `null` to create a new one
 * @returns New VFiles with the compiled content (potentially multiple per source)
 */

export async function compile(
  source: VFile,
  options?: CompileOptions
): Promise<Readonly<CompiledSimulation>> {
  const log =
    options?.log?.getSubLogger({ name: LOGGER_NAME }) ??
    new Logger({ name: LOGGER_NAME, minLevel: 3 });

  const groupConfiguration: NodeGroupingOptions = {
    match: { type: 'heading', depth: 2 },
    wrap: 'screen',
    log: log,
    ...options?.group,
  };

  const splitConfiguration: SplitOptions = {
    match: 'screen',
    log: log,
    ...options?.split,
  };

  const renderConfiguration: RenderOptions = {
    format: 'html',
    log: log,
    ...options?.render,
  };

  const singlePage = options?.singlePage ?? false;

  log.trace('compiling', source.path);
  const ast = unified().use(remarkParse).use([remarkFrontmatter, remarkDirective]).parse(source);

  const transformedTree = unified()
    .use(freezeTree) // make the tree immutable
    .use(hoistMetadata) // move metadata to the root or its section heading
    .use(groupNodes, groupConfiguration)
    // TODO Add other stages here
    .runSync(ast);

  const globalMetadata = extractMetadata(transformedTree as Root, 'global', log);
  const trees = singlePage ? [transformedTree as Root] : splitTrees(splitConfiguration)(transformedTree) as Root[];
  const pages = render(trees, renderConfiguration, globalMetadata);

  return freeze({ pages: pages });
}
