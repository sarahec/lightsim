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

import { u } from 'unist-builder';
import find from '../find.js';

describe('find', () => {
  const text = u('text', 'Hello, world!');
  const heading = u('heading', [text]);
  const tree = u('root', [heading]);

  it('should return undefined if not found', () => {
    expect(find(tree, 'nothing')).toBeUndefined();
  });

  it('should return the found node', () => {
    const result = find(tree, 'root');
    expect (result?.value).toBe(tree);
  });

  it('should return deep nodes', () => {
    const result = find(tree, 'text');
    expect(result?.value).toBe(text);
  });
});

describe('replace', () => {
  const tree = u('root', [u('heading', [u('text', 'Hello, world')])]);

  it('should replace a mutable node', () => {
    const result = find(tree, 'text')?.replace(u('text', 'Hey'));
    expect(result).toEqual(u('root', [u('heading', [u('text', 'Hey')])]));
  });
});

describe('remove', () => {
  const tree = u('root', [u('heading', [u('text', 'Hello, world')])]);

  it('should remove a mutable node', () => {
    const result = find(tree, 'text')?.remove();
    expect(result).toEqual(u('root', [u('heading', [])]));
  });
});


