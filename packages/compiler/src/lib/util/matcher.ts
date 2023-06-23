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

import { type Node } from 'unist';

export type MatchFn = (probe: Node) => boolean;
export type MatcherType = string | Node | MatchFn;

/**
 * Converts a match specifier (type string, partial node, or function) into a function that can be used to test a node.
 *
 * @param matcher A type string ('foo'), a partial node ({type: 'foo', value: 'bar'}), or a function (node) => boolean.
 */
export default function makeMatchFn(matcher: MatcherType): MatchFn {
  if (typeof matcher === 'string') {
    return (probe: Node) => probe.type === matcher;
  }
  if (typeof matcher === 'function') {
    return matcher;
  }

  return (probe: Node) => {
    for (const key in matcher) {
      // @ts-expect-error implicit any
      if (probe[key] !== matcher[key]) return false;
    }
    return true;
  };
}
