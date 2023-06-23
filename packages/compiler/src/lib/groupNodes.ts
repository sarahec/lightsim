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

import { type Node, type Parent } from 'unist';

import { ILogObj, Logger } from 'tslog';
import makeMatchFn, { type MatcherType } from './util/matcher.js';
import makeWrapFn, { type WrapperType } from './util/wrapper.js';
import { produce } from 'immer';

export interface NodeGroupingOptions {
  readonly match: MatcherType;
  readonly wrap: WrapperType;
  readonly log?: Logger<ILogObj>;
}

const LOGGER_NAME = 'group nodes';

/**
 * Split a tree into multiple sections based on a predicate
 * then wrap in a user-defined container.
 */
/** @type {import('unified').Plugin<[Options]>} */
export default function groupNodes(options: NodeGroupingOptions) {
  const matcher = makeMatchFn(options.match);
  const wrapper = makeWrapFn(options.wrap);
  const log =
    options?.log?.getSubLogger({ name: LOGGER_NAME }) ??
    new Logger({ name: LOGGER_NAME, minLevel: 3 });

  return (tree: Node): Readonly<Node> => {
    // No tree? No-op.
    if (!Object.prototype.hasOwnProperty.call(tree, 'children')) {
      log.warn('No children found in tree');
      return tree;
    }

    const matches: number[] = [];
    (tree as Parent).children.forEach((probe: Node, index: number) => {
      if (matcher(probe)) {
        matches.push(index);
        log.silly(`Found match at index ${index}`);
      }
    });
    if (matches.length == 0) {
      log.trace('No matches found');
      return tree;
    }
    matches.unshift(0); // Always include the start of the tree
    const wrappedNodes = matches.map((matchPos, i) => {
      const atEnd = i == matches.length - 1;
      const endIndex = atEnd ? undefined : matches[i + 1];
      return wrapper(
        (tree as Parent).children.slice(matchPos, endIndex),
        i,
        (tree as Parent).children[matchPos]
      );
    });
    const newTree = produce(tree, (draft) => ({...draft, children: wrappedNodes})) as Readonly<Node>;
    log.silly(`New tree: ${JSON.stringify(newTree)}`);
    return newTree;
  };
}
