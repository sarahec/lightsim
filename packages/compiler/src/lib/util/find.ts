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
  node: AnyNode;
  index?: number;
};

interface FindResult {
  value: Readonly<AnyNode> | undefined;
  replace(newValue: AnyNode): AnyNode;
  remove(): AnyNode;
};

export default function find(root: AnyNode, matcher: MatcherType): FindResult | undefined {  
  const matchFn = makeMatchFn(matcher);
  const found = findPathRecursive(root);
  return found ? makePath(found) : undefined;

  // recursively apply the match function to each node in the tree
  // and return the path to the first node that matches
    function findPathRecursive(probe: AnyNode, path: PathStep[] = []): PathStep[] | undefined {
    if (matchFn(probe)) {
      return path.concat({ node: probe });
      //@ts-expect-error this is a reasonable way to see if there are any children
    }  else if (probe.children) {
        const p = probe as Parent;
        for (let i = 0; i < p.children.length; i++) {
            const childPath = findPathRecursive(p.children[i], path.concat({ node: p, index: i }));
            if (childPath) return childPath;
        }
    }
    return undefined;
    }

    // wrap the path in a Path object
    function makePath(steps: PathStep[]): FindResult {    
    const value = steps.pop()?.node;
    return {
      value,
      replace(newValue: AnyNode): AnyNode {
        if (steps.length === 0) {
          return newValue as Parent;
        }
        const step = steps[steps.length - 1];
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        (step.node as Parent).children.splice(step.index!, 1, newValue);
        return steps[0].node;
      },
      remove(): AnyNode {
        if (steps.length === 0) {
          throw new Error('Cannot remove root node');
        }
        const step = steps[steps.length - 1];
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        (step.node as Parent).children.splice(step.index!, 1);
        return steps[0].node;
      }
    };
  };
}