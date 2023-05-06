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

import { type Parent, type Node } from 'unist';
import { type VFile } from 'vfile';

import { type MatcherType, makeMatchFn } from './util/matcher';
import { type WrapperType, makeWrapFn } from './util/wrapper';

export interface NodeGroupingOptions {
  match: MatcherType;
  wrap: WrapperType;
}

/**
 * Split a tree into multiple sections based on a predicate
 * then wrap in a user-defined container.
 */
/** @type {import('unified').Plugin<[Options]>} */
export function groupNodes(options: NodeGroupingOptions) {
  const matcher = makeMatchFn(options.match);
  const wrapper = makeWrapFn(options.wrap);

  return (tree: Node, file?: VFile): Node => {
    // No tree? No-op.
    if (!Object.prototype.hasOwnProperty.call(tree, 'children')) return tree;

    const matches: number[] = [];
    (tree as Parent).children.forEach((probe: Node, index: number) => {
      if (matcher(probe)) matches.push(index);
    });
    if (matches.length == 0) return tree;
    const wrappedNodes = matches.map((matchPos, i) => {
      const atEnd = i == matches.length - 1;
      const endIndex = atEnd ? undefined : matches[i + 1];
      return wrapper(
        (tree as Parent).children.slice(matchPos, endIndex),
        i,
        (tree as Parent).children[matchPos]
      );
    });
    const newTree = { ...tree, children: wrappedNodes };
    // @ts-expect-error the type checker doesn't know what to do with the conditional property
    if (tree === file?.data) {
      file.data = newTree;
    }
    return newTree;
  };
}
