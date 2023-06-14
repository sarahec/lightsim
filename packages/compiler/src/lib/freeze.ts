// Copyright 2023 Sarah Clark
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { ILogObj, Logger } from 'tslog';

const LOGGER_NAME = 'freeze';

export type FreezeOptions = {
  readonly log?: Logger<ILogObj>;
};

/**
 * Walk the tree, calling Object.freeze on each node.
 */

/** @type {import('unified').Plugin<[Options]>} */
export function freeze(options?: FreezeOptions): (tree: Node) => Node
{
  const log =
    options?.log?.getSubLogger({ name: LOGGER_NAME }) ??
    new Logger({ name: LOGGER_NAME, minLevel: 3 });

  log.trace('Freezing tree');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function _freeze(tree: any /* Node */): any /* Node */ {
    Object.freeze(tree);
    tree.children?.forEach(_freeze);
    return tree;
  };
}
