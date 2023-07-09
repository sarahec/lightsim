/* eslint-disable @typescript-eslint/no-explicit-any */
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

/**
 * Matching function, matched the parameters used by unist::filter
 */
export type MatchFn = (probe: Node, name?: string, value?: object,) => boolean;

export type MatcherType = string | Record<string, any> | MatchFn;

/**
 * Converts a match specifier (type string, partial node, or function) into a function that can be used to test a node.
 *
 * @param matcher A type string ('foo'), a partial node ({type: 'foo', value: 'bar'}), or a MatchFn.
 */
export default function makeMatchFn(matcher: MatcherType): MatchFn {
  switch (typeof matcher) {
    case 'string':
      return (probe: Node) => probe.type === matcher;
      break;
    case 'function':
      return matcher as MatchFn;
      break;
    case 'object': {
      const m = matcher as Record<string, any>;
      return (probe: Node, name?: string, value?: object,) => {
        for (const key in m) {
          if (key === 'name') {
            if (name !== m[key]) return false;
          }
          if (key === 'value') {
            if (value !== undefined && value !== m[key]) return false;
          }
          // @ts-expect-error an unknown key will return undefined, which we can compare to the desired value
          if (probe[key] !== m[key]) return false;
        }
        return true;
      };
    };
    default:
      throw new Error(`Invalid matcher type: ${typeof matcher}`);
  };
}
