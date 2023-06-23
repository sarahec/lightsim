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
import makeMatchFn from './matcher';

 export type MatchFn = (probe: Node) => boolean;
 export type MatcherType = string | Node | MatchFn;
 
export default function findPath(matcher: MatcherType, root: Parent):  number[] | undefined{
  const matchFn = makeMatchFn(matcher);
    return findPathRecursive(root, []);

  // recursively apply the match function to each node in the tree
  // and return the path to the first node that matches
    function findPathRecursive(node: Node | Parent, path: number[]): number[] | undefined {
    if (matchFn(node)) {
      return path;
      //@ts-expect-error this is a reasonable way to see if there are any children
    }  else if (node.children) {
        const p = node as Parent;
        for (let i = 0; i < p.children.length; i++) {
            const childPath = findPathRecursive(p.children[i], path.concat(i));
            if (childPath) return childPath;
        }
        }
    return undefined;
    }
}