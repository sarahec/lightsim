/* eslint-disable @typescript-eslint/no-non-null-assertion */
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
import makeMatchFn, { type MatcherType } from './matcher';

type PathStep = {
  node: Parent;
  index: number;
  numChildren: number;
};

/**
 * The outcome of a find operation.
 * 
 * Note that will only work if the node is not the root node.
 * 
 * @property value The found node.
 * @property replace Replaces the found node with the new value. Returns the tree root.
 * @property remove Removes the found node. Returns the tree root.
 * @property findParent Reverse search the parents to find a node. Returns a new FindResult.
 */
export type FindResult = {
  node: Readonly<Node>;
  replace: (newValue: Node) => Node;
  remove: (removeEmptyContainer?: boolean) => Node;
  findParent(matcher?: MatcherType): FindResult | undefined;
  findBefore(matcher: MatcherType): FindResult | undefined;
};

/**
 * Returns a generator with all matching nodes in depth-first order.
 * 
 * @param root start of the search tree.
 * @param matcher matching pattern for the node (string, object, or function: boolean)
 */
export function* findAll(root: Node, matcher: MatcherType): Generator<FindResult> {

  function makeFindResult(value: Node, parents: PathStep[]): FindResult {
    const noParents = parents.length === 0;

    // Copy the `parents` array, making a shallow copy of each step
    const parentCopy = parents.map((step) => ({ ...step })) as PathStep[];
    return {
      node: value,

      findParent: (matcher?: MatcherType) => {
        if (noParents) return undefined;
        if (!matcher) {
          return makeFindResult(parentCopy.at(-1)!.node, parentCopy.slice(0, -1));
        }
        const matchFn = makeMatchFn(matcher);
        for (let i = parentCopy.length - 1; i >= 0; i--) {
          const step = parentCopy[i];
          if (matchFn(step.node)) {
            return makeFindResult(step.node, parentCopy.slice(0, i));
          }
        }
        // no match found
        return undefined;
      },

      // Reverse search along the peers all the way up the chain
      findBefore: (matcher: MatcherType) => {
        const matchFn = makeMatchFn(matcher);
        for (let i = parentCopy.length - 1; i >= 0; i--) {
          const step = parentCopy[i];
          for (let j = step.index; j >= 0; j--) {
            const sibling = step.node.children[j];
            if (matchFn(sibling)) {
              return makeFindResult(sibling, parentCopy.slice(0, i));
            }
          }
          if (matchFn(step.node)) {
            return makeFindResult(step.node, parentCopy.slice(0, i));
          }
        }
        // no match found
        return undefined;
      },

      replace: (newValue: Node) => {
        if (noParents) throw new Error('Cannot replace root node');
        const step = parentCopy.at(-1)!;
        (step.node as Parent).children.splice(step.index!, 1, newValue);
        return parentCopy[0].node;
      },
      remove: (removeEmptyContainer?: boolean) => {
        if (noParents) throw new Error('Cannot remove root node');
        const step = parentCopy.at(-1)!;
        (step.node).children.splice(step.index!, 1);
        if (removeEmptyContainer && step.node.children.length === 0 && parentCopy.length > 1) {
          const parentStep = parentCopy.at(-2)!;
          parentStep.node.children.splice(parentStep.index!, 1);
        }
        return parentCopy[0].node;
      }
    };
  };



  const matchFn = makeMatchFn(matcher);
  const parents: PathStep[] = [];
  let probe = root;
  let step: PathStep | undefined;

  while (probe) {
    if (matchFn(probe)) {
      yield makeFindResult(probe, parents);
    }
    // @ts-expect-error idiomatic JS is fine
    if (probe.children) { // descend into a parent node
      step = { node: probe as Parent, index: 0, numChildren: ((probe as Parent).children.length) };
      parents.push(step);
    } else {
      step!.index++;
      while (step!.index >= step!.numChildren) { // ascend to the next parent
        step = parents.pop();
        if (!step) return { value: undefined, done: true };
        step.index++;
      }
    }
    probe = step!.node.children[step!.index];
  }
  return { value: undefined, done: true };
}

/**
 * Returns the first matching node in depth-first order.
 * 
 * @param root start of the search tree.
 * @param matcher matching pattern for the node (string, object, or function: boolean)
 */
export default function find(root: Node, matcher: MatcherType): FindResult | undefined {
  const found = findAll(root, matcher).next();
  return found.done ? undefined : found.value;
}
