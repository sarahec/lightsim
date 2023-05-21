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

import { Root } from 'mdast';
import remarkParse from 'remark-parse';
import { ILogObj, Logger } from 'tslog';
import { unified } from 'unified';
import { VFile } from 'vfile';
import { NodeGroupingOptions, groupNodes } from './lib/groupNodes.js';
import { FileFormat, RenderOptions, render } from './lib/render.js';
import { SplitOptions, splitTrees } from './lib/split-trees.js';
import { MatcherType } from './lib/util/matcher.js';

const LOGGER_NAME = 'compiler';

// import { inspect } from 'unist-util-inspect';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface CompileOptions {
  group?: NodeGroupingOptions;
  split?: SplitOptions;
  render?: RenderOptions;
  log?: Logger<ILogObj>;
}

/**
 * Compiles and formats a list of VFiles.
 *
 * @param source A single markdown page
 * @param options Options for the compiler
 * @param logger A parent logger or or `null` to create a new one
 * @returns New VFiles with the compiled content (potentially multiple per source)
 */

async function compile(
  source: VFile,
  options?: CompileOptions
): Promise<VFile[]> {
  const log =
    options?.log?.getSubLogger({ name: LOGGER_NAME }) ??
    new Logger({ name: LOGGER_NAME, minLevel: 3 });

  const groupConfiguration: NodeGroupingOptions = {
    match: { type: 'heading', depth: 2 } as MatcherType,
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
    format: FileFormat.HTML,
    log: log,
    ...options?.render,
  };
  log.trace('compiling', source.path);
  const ast = await unified().use(remarkParse).parse(source);

  const processedTree = await unified()
    .use(groupNodes, groupConfiguration)
    // TODO Add other stages here
    .run(ast);

  // @ts-expect-error TS wants Node<Data> but there's no way to instantiate that
  const trees = splitTrees(splitConfiguration)(processedTree) as Root[];
  return render(trees, renderConfiguration);
}

export { CompileOptions, compile, compile as default };
