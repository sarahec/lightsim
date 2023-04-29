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
import { VFile } from 'vfile';

type MatchFn = (probe: Node) => boolean;
type WrapFn = (nodes: Node[], count?: number, matched?: Node) => Parent;

export interface EncapsulateOptions {
  match: MatchFn,
  wrap: WrapFn;
}

/**
 * Split a tree into multiple sections based on a predicate
 * then wrap in a user-defined container.
 */
/** @type {import('unified').Plugin<[Options]>} */
export function encapsulate(options: EncapsulateOptions) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return (tree: Node, file: VFile): Node => {
    // No tree? No-op.
    if (!Object.prototype.hasOwnProperty.call(tree, 'children')) return tree;

    const wrappedNodes: Node[] = [];

    let startIndex = 0;
    // @ts-expect-error we confirmed the tree has children[]
    tree.children.forEach((probe: Node, index: number) => {
      if (options.match(probe) && index > startIndex) {
        wrappedNodes.push(
          options.wrap(
            // @ts-expect-error children[] exists
            tree.children.slice(startIndex, index),
            wrappedNodes.length,
            probe
          )
        );
        startIndex = index;
      }
    });
    // @ts-expect-error children[] exists
    if (startIndex < tree.children.length) {
      wrappedNodes.push(options.wrap(
        // @ts-expect-error children[] exists
        tree.children.slice(startIndex),
        wrappedNodes.length
      ));
    }
    if (!wrappedNodes.length) return tree;
    // @ts-expect-error a tree is still a tree
    tree.children = wrappedNodes;
    return tree;
  };
}
