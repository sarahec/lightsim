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

import { VFile } from 'vfile';
import { NodeGroupingOptions, groupNodes } from './groupNodes';
import { FileFormat, RenderOptions, render } from './rendering';
import { Parent, Root } from 'mdast';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import {SplitOptions, splitTrees } from './splitTrees';


// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface CompileOptions{ 
  group?: NodeGroupingOptions;
  split?: SplitOptions;
  render?:  RenderOptions;
};

/**
 * Compiles and formats a list of VFiles.
 *
 * @param sources Markdown pages to be compiled
 * @param format Output format
 * @returns New VFiles with the compiled content (potentially multiple per source)
 */
export async function compiler(source: VFile, options?: CompileOptions): Promise<VFile[]> {
  const configuration = { 
    format: FileFormat.HTML,
    match: {type: 'heading', depth: 2},
    wrap: 'page',
    unwrap: 'page',
    count: 0,
    ...options
  };

  const ast = await unified()
      .use(remarkParse)
      .parse(source);

  const trees = await unified()
      .use(groupNodes, configuration)
      // TODO Add other stages here
      .use(splitTrees, configuration)
      .run(ast) as unknown as Root[];

  return render(trees, configuration);
  }



export interface Screen extends Parent {
  type: 'screen';
}

export const wrapScreen = (nodes: Node[]) => ({
  type: 'screen',
  children: nodes,
});
