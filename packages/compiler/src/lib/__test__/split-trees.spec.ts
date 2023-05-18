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

import { u } from 'unist-builder';
import { splitTrees } from '../split-trees';
import { unified } from 'unified';

describe('split', () => {
  const tree = u('root', [
    u('page', [u('heading', { depth: 2 }, [u('text', 'Hello')])]),
    u('page', [u('heading', { depth: 2 }, [u('text', 'World')])]),
  ]);

  it('should return the tree if no matches are found', () => {
    const processor = unified().use(splitTrees, { match: 'foo' });
    expect(processor.runSync(tree)).toEqual([tree]);
  });

  it('should return a set of trees if found', () => {
    const processor = unified().use(splitTrees, { match: 'page' });
    const trees = processor.runSync(tree) as unknown as Node[];
    expect(trees).toHaveLength(2);
    expect(trees).toEqual([
      u('root', [u('heading', { depth: 2 }, [u('text', 'Hello')])]),
      u('root', [u('heading', { depth: 2 }, [u('text', 'World')])]),
    ]);
  });
});
