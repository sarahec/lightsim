// Copyright 2023 Sarah Clark
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { freeze, produce } from 'immer';
import { unified } from 'unified';
import { u } from 'unist-builder';
import splitTrees from '../split-trees.js';

describe('split', () => {
  const rawTree = u('root', [
    u('page', [u('heading', { depth: 2 }, [u('text', 'Hello')])]),
    u('page', [u('heading', { depth: 2 }, [u('text', 'World')])]),
  ]);
  const tree = produce(rawTree, (draft) => {
    freeze(draft, true);
  });

  it('should return the tree if no matches are found', () => {
    // @ts-expect-error - ignore type confusion re: plugin type definition
    const processor = unified().use(splitTrees, { match: 'foo' });
    expect(processor.runSync(tree)).toEqual([rawTree]);
  });

  it('should return a set of trees if found', () => {
    // @ts-expect-error - ignore type confusion re: plugin type definition
    const processor = unified().use(splitTrees, { match: 'page' });
    const trees = processor.runSync(tree) as unknown as Node[];
    expect(trees).toHaveLength(2);
    expect(trees).toEqual([
      u('root', [u('heading', { depth: 2 }, [u('text', 'Hello')])]),
      u('root', [u('heading', { depth: 2 }, [u('text', 'World')])]),
    ]);
    expect(Object.isFrozen(trees)).toBe(true);
    expect(Object.isFrozen(trees[0])).toBe(true);
  });
});
