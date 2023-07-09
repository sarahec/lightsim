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
import makeMatchFn, { MatchFn } from '../matcher.js';

describe('makeMatchFn', () => {
  it('should accept and return a function', () => {
    const fn: MatchFn = (node: Node) => node.type === 'heading';
    expect(makeMatchFn(fn)).toBe(fn);
  });

  it('should accept a node type', () => {
    const fn = makeMatchFn('heading');
    expect(fn({ type: 'heading' })).toEqual(true);
    expect(fn({ type: 'root' })).toEqual(false);
  });

  it('should accept a partial node', () => {
    const fn = makeMatchFn({ type: 'heading', depth: 2 });
    expect(fn({ type: 'heading', depth: 1 } as Node)).toEqual(false);
    expect(fn({ type: 'heading', depth: 2 } as Node)).toEqual(true);
    expect(fn({ type: 'root' })).toEqual(false);
  });
});
