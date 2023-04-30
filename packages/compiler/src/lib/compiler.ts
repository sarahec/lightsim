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
import { Logger, ILogObj } from 'tslog';
import { group } from './encapsulate';
import { toHTML, toMarkdown } from './rendering';
import { Parent } from 'mdast';

export enum FileFormat {
  HTML = 'html',
  Markdown = 'md',
}

/**
 * Compiles and formats a list of VFiles.
 *
 * @param sources Markdown pages to be compiled
 * @param format Output format
 * @returns New VFiles with the compiled content (potentially multiple per source)
 */
export function compile(sources: VFile[], format: FileFormat): VFile[] {
  const log: Logger<ILogObj> = new Logger();
  const outputs: VFile[] = [];
  // TODO Reimplement as a pair of plugins (one to compile, one to render into files)
  //   const formatter = format == FileFormat.HTML ? toHTML : toMarkdown;
  //   for (const source of sources) {
  //     log.trace(`Compiling ${source.path}`);
  //     const pages = splitFile(source);
  //     outputs.push(...pages.map((page) => formatter(page)));
  //   }
  return outputs;
}


export interface Screen extends Parent {
  type: 'screen'
};

export const wrapScreen = (nodes: Node[]) => ({ type: 'screen', children: nodes });


