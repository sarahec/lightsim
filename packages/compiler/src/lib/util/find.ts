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
import makeMatchFn, { type MatcherType} from './matcher';

type AnyNode = Node | Parent;

interface PathStep {
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
 */
interface FindResult {
  value: Readonly<AnyNode>;
  replace: (newValue: AnyNode) => AnyNode;
  remove: () => AnyNode;
};

/**
 * Returns a generator with all matching nodes in depth-first order.
 * 
 * @param root start of the search tree.
 * @param matcher matching pattern for the node (string, object, or function: boolean)
 */
export function *findAll(root: AnyNode, matcher: MatcherType): Generator<FindResult> {

  function makeFindResult(value: AnyNode, parents: PathStep[]): FindResult {
    const noParents = parents.length === 0;

    // Copy the `parents` array, making a shallow copy of each step
    const parentCopy = parents.map((step) => ({node: step.node, index: step.index})) as PathStep[];

    return {
      value,
      replace: (newValue: AnyNode) => {
        if (noParents) throw new Error('Cannot replace root node');
        const step = parentCopy.at(-1)!;
        (step.node as Parent).children.splice(step.index!, 1, newValue);
        return parentCopy[0].node;
      },
      remove: () => {
        if (noParents) throw new Error('Cannot remove root node');
        const step = parentCopy.at(-1)!;
        (step.node as Parent).children.splice(step.index!, 1);
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
        step = { node: probe as Parent, index: 0, numChildren: ((probe as Parent).children.length)};
        parents.push(step);
    } else {
      step!.index++;
      while (step!.index >= step!.numChildren) { // ascend to the next parent
        step = parents.pop();
        if (!step) return {value: undefined, done: true};
        step.index++;
      }
    }
    probe = step!.node.children[step!.index];
  }
  return {value: undefined, done: true};
}

/**
 * Returns the first matching node in depth-first order.
 * 
 * @param root start of the search tree.
 * @param matcher matching pattern for the node (string, object, or function: boolean)
 */
export default function find(root: AnyNode, matcher: MatcherType): FindResult | undefined {
  const found = findAll(root, matcher).next();
  return found.done ? undefined : found.value;
}
