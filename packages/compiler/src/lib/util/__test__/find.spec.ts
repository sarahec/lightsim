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

import { freeze, produce } from 'immer';
import { type Root } from 'mdast';
import { u } from 'unist-builder';
import find, { FindResult, findAll } from '../find.js';

describe('findAll', () => {
  const bodyText = u('text', 'This is a test!');
  const headingText = u('text', 'Hello, world!');
  const heading = u('heading', [headingText]);

  const tree = u('root', [heading, bodyText]);

  it('should return nothing if not found', () => {
    const gen = findAll(tree, 'nothing')
    expect(gen.next().done).toBe(true);
  });

  it('should return the found node', () => {
    const gen: Generator = findAll(tree, 'root');
    const next = gen.next();
    expect(next.value.node).toBe(tree);
    expect(next.done).toBe(false);
    expect(gen.next().done).toBe(true);
  });

  it('should return all found nodes', () => {
    const gen = findAll(tree, 'text');
    expect(gen.next().value.node).toBe(headingText);
    expect(gen.next().value.node).toBe(bodyText);
    expect(gen.next().done).toBe(true);
  });
});


describe('find', () => {
  const text = u('text', 'Hello, world!');
  const heading = u('heading', { name: 'h1' }, [text]);
  const tree = u('root', [heading]);

  it('should return undefined if not found', () => {
    expect(find(tree, 'nothing')).toBeUndefined(); find
    const result = find(tree, 'root');
    expect(result?.node).toBe(tree);
  });

  it('should find based on node type', () => {
    const result = find(tree, 'text');
    expect(result?.node).toBe(text);
  });

  it('should find based on node value', () => {
    const result = find(tree, { type: 'text', value: 'Hello, world!' });
    expect(result?.node).toBe(text);
  });

});

describe('findResult', () => {
  let tree: Root;

  beforeEach(() => {
    tree = u('root', [u('heading', [u('text', 'Hello, world')])]) as Root;
  });

  describe('findParent', () => {
    it('should return undefined if no parent matches', () => {
      const result = find(tree, 'text')!.findParent('unknown');
      expect(result).toBeUndefined();
    });

    it('should return the immediate parent if no matcher', () => {
      const result = find(tree, 'text')!.findParent();
      expect(result?.node).toEqual(u('heading', [u('text', 'Hello, world')]));
    });

    it('should return the parent specified by the matcher', () => {
      const result = find(tree, 'text')!.findParent('root');
      expect(result?.node).toEqual(tree);
    });
  });

  describe('findBefore', () => {

    beforeEach(() => {
      tree = u('root', [u('heading', [u('text', 'Hello, world')]), u('meta', { name: 'title', attributes: 'Hello' })]) as Root;
    });

    it('should return undefined if no match', () => {
      const result = find(tree, 'meta')!.findBefore('none');
      expect(result).toBeUndefined();
    });

    it('should return the peer specified by the matcher', () => {
      const result = find(tree, 'text')!.findBefore('heading');
      expect(result?.node.type).toEqual('heading');
    });
  });

  describe('replace', () => {
    it('should replace a mutable node', () => {
      const result = find(tree, 'text')!.replace(u('text', 'Hey'));
      expect(result).toEqual(u('root', [u('heading', [u('text', 'Hey')])]));
    });

    it('replace should work with immer', () => {
      const _tree = freeze(tree, true);
      // @ts-expect-error TODO remove this once immer exports WritableDraft correctly (then we can use WritableDraft<Root>) 
      const result = produce(_tree, (draft) => find(draft, 'text')!.replace(u('text', 'Hey')));
      expect(result).toEqual(u('root', [u('heading', [u('text', 'Hey')])]));
    });
  });

  describe('remove', () => {
    it('should remove a mutable node', () => {
      const result = find(tree, 'text')?.remove();
      expect(result).toEqual(u('root', [u('heading', [])]));
    });

    it('should work with immer', () => {
      const _tree = freeze(tree, true);
      // @ts-expect-error TODO remove this once immer exports WritableDraft correctly (then we can use WritableDraft<Root>) 
      const result = produce(_tree, (draft) => find(draft, 'text')?.remove());
      expect(result).toEqual(u('root', [u('heading', [])]));
    });

    it('should clean up parent if no children', () => {
      const result = find(tree, 'text')?.remove(true);
      expect(result).toEqual(u('root', []));
    });

  });
});
