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
import { makeWrapFn } from '../wrapper';

describe('makeWrapFunction', () => {
  it('should accept and return a function', () => {
    const fn = (nodes: Node[]) => ({ type: 'page', children: nodes });
    expect(makeWrapFn(fn)).toEqual(fn);
  });

  it('should accept a node type', () => {
    const fn = makeWrapFn('page');
    expect(fn([{ type: 'heading', depth: 1 } as Node])).toEqual({
      type: 'page',
      children: [{ type: 'heading', depth: 1 }],
    });
  });

  it('should accept a partial node', () => {
    const fn = makeWrapFn({ type: 'page' });
    expect(fn([{ type: 'heading', depth: 1 } as Node])).toEqual({
      type: 'page',
      children: [{ type: 'heading', depth: 1 }],
    });
  });
});
