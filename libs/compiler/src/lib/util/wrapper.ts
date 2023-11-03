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

export type WrapFn = (
  nodes: Node[],
  count?: number,
  matched?: Node,
) => Parent;

export type WrapperType = string | Node | WrapFn;

/**
 * Converts a wrapper specifier (type string, partial node, or function) into a wrapper function.
 *
 * @param wrapper A type string ('foo'), a partial node ({type: 'foo', value: 'bar'}), or a function (node) => boolean.
 */
export default function makeWrapFn(wrapper: WrapperType): WrapFn {
  if (typeof wrapper === 'string') {
    return (nodes: Node[]) => ({ type: wrapper, children: nodes });
  }
  if (typeof wrapper === 'function') {
    return wrapper;
  }
  // wrapper is a partial node
  return (nodes: Node[]) => ({
    ...wrapper,
    children: nodes,
  });
}
