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
import freezeTree from '../freezeTree';
import { unified } from 'unified';

describe('freezeTree', () => {
  const tree = u('root', [
    u('page', [u('heading', { depth: 2 }, [u('text', 'Hello')])]),
    u('page', [u('heading', { depth: 2 }, [u('text', 'World')])]),
  ]);

  it('should freeze all of the children', () => {
    const processor = unified().use(freezeTree);
    const tree2 = processor.runSync(tree);
    expect(tree2).toBe(tree);
    tree.children.forEach((node) => { expect(Object.isFrozen(node)).toBe(true); });
  });

});
