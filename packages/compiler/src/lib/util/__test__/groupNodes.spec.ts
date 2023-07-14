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

import { unified } from 'unified';

import groupNodes from '../groupNodes';
import { type Node } from 'unist';
import { u } from 'unist-builder';

const matchFn = (probe: Node) =>
  // @ts-expect-error heading nodes always have a depth
  probe.type === 'heading' && probe.depth === 2;

const wrapFn = (nodes: Node[]) => ({
  type: 'page',
  children: nodes,
});

const processor = unified().use(groupNodes, {
  match: matchFn,
  wrap: wrapFn,
});

describe('group plugin', () => {
  it('Should do nothing if empty tree', async () => {
    const tree = u('root', []);
    const expected = tree;
    const result = processor.runSync(tree);
    expect(result).toEqual(expected);
  });

  it('Should do nothing if no match', async () => {
    const tree = u('root', [u('heading', { depth: 1 }, [u('text', 'Hello')])]);
    const expected = tree;
    const result = processor.runSync(tree);
    expect(result).toEqual(expected);
  });

  it('Should wrap matched content', async () => {
    const h2Tree = u('root', [
      u('heading', { depth: 1 }, [u('text', 'Hello')]),
      u('heading', { depth: 2 }, [u('text', 'World')]),
    ]);
    const paginatedH2Tree = u('root', [
      u('page', [u('heading', { depth: 1 }, [u('text', 'Hello')])]),
      u('page', [u('heading', { depth: 2 }, [u('text', 'World')])]),
    ]);
    const result = processor.runSync(h2Tree);
    expect(result).toEqual(paginatedH2Tree);
  });
});