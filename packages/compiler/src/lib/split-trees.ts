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

import { produce } from 'immer';
import { ILogObj, Logger } from 'tslog';
import { MatcherType, makeMatchFn } from './util/matcher.js';

const LOGGER_NAME = 'split trees';

export type SplitOptions = {
  readonly match: MatcherType;
  readonly log?: Logger<ILogObj>;
};

/**
 * Split a tree into multiple sections based on a predicate.
 * CAUTION: The return type is a *list* of trees.
 */

/** @type {import('unified').Plugin<[Options]>} */
export function splitTrees(options: SplitOptions): (tree: Node) => Node[] {
  const matcher = makeMatchFn(options.match);
  const log =
    options?.log?.getSubLogger({ name: LOGGER_NAME }) ??
    new Logger({ name: LOGGER_NAME, minLevel: 3 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (tree: any /* Node */) => {
    if (!Object.prototype.hasOwnProperty.call(tree, 'children')) {
      log.error('no children found in tree');
      return [];
    }
    const matches = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tree.children.forEach((probe: any, index: number) => {
      if (matcher(probe)) {
        log.silly(`found match at index ${index}`);
        matches.push(index);
      }
    });
    if (matches.length == 0) {
      log.trace('no matches found');
      return [tree];
    }
    if (matches.length != tree.children.length) {
      log.warn('all matches should be at the top level of the tree');
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = tree.children.map((child: any /* Node */) => (produce(child, (draft: any) => { return { ...draft, type: 'root' }; })));
    log.silly(`result: ${JSON.stringify(result)}`);
    return Object.freeze(result);
  };
}
