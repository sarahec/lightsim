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

import { Processor, unified } from 'unified';

import { group } from './encapsulate';
import { type Node } from 'unist';
import { u } from 'unist-builder';

const matchFn = (probe: Node) =>
  // @ts-expect-error heading nodes always have a depth
  probe.type === 'heading' && probe.depth === 2;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const wrapFn = (nodes: Node[], count?: number, matched?: Node) => ({
  type: 'page',
  children: nodes,
});
let configuredProcessor: Processor;
let h2Tree: Node;
let paginatedH2Tree: Node;

beforeEach(() => {
  configuredProcessor = unified().use(group, { match: matchFn, wrap: wrapFn });
  h2Tree = u('root', [
    u('heading', { depth: 2 }, [u('text', 'Hello')]),
    u('heading', { depth: 2 }, [u('text', 'World')]),
  ]);
  paginatedH2Tree = u('root', [
    u('page', [u('heading', { depth: 2 }, [u('text', 'Hello')])]),
    u('page', [u('heading', { depth: 2 }, [u('text', 'World')])]),
  ]);
});

describe('group plugin', () => {
  it('Should do nothing if empty tree', async () => {
    const tree = u('root', []);
    const expected = tree;
    const result = configuredProcessor.runSync(tree);
    expect(result).toEqual(expected);
  });

  it('Should do nothing if no match', async () => {
    const tree = u('root', [u('heading', { depth: 1 }, [u('text', 'Hello')])]);
    const expected = tree;
    const result = configuredProcessor.runSync(tree);
    expect(result).toEqual(expected);
  });
});

describe('match option', () => {
  it('should accept a match function', () => {
    const result = unified()
      .use(group, { match: matchFn, wrap: wrapFn })
      .runSync(h2Tree);
    expect(result).toEqual(paginatedH2Tree);
  });

  it('should accept a node type', () => {
    const result = unified()
      .use(group, { match: 'heading', wrap: wrapFn })
      .runSync(h2Tree);
    expect(result).toEqual(paginatedH2Tree);
  });

  it('should accept a partial node', () => {
    const result = unified()
      .use(group, { match: u('heading', { depth: 2 }), wrap: wrapFn })
      .runSync(h2Tree);
    expect(result).toEqual(paginatedH2Tree);
  });
});

describe('wrap option', () => {
  it('should accept a wrap function', () => {
    const result = configuredProcessor
      .use(group, { match: matchFn, wrap: wrapFn })
      .runSync(h2Tree);
    expect(result).toEqual(paginatedH2Tree);
  });

  it('should accept a node type', () => {
    const result = unified()
      .use(group, { match: matchFn, wrap: 'page' })
      .runSync(h2Tree);
    expect(result).toEqual(paginatedH2Tree);
  });

  it('should accept a partial node', () => {
    const result = unified()
      .use(group, { match: matchFn, wrap: { type: 'page' } })
      .runSync(h2Tree);
    expect(result).toEqual(paginatedH2Tree);
  });
});
