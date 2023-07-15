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
import { u } from 'unist-builder';
import { CONTINUE, visit } from 'unist-util-visit';
import { VFile } from 'vfile';
import precompile from '../precompiler.js';

const removePositions = (tree: Node) => visit(tree, node => { delete node['position']; return CONTINUE; });

describe('precompiler', () => {

  it('should export a single page', async () => {
    const singlePage = new VFile({
      path: 'test.md',
      value: `# Hello\n\nhow are you?`,
    });
    const precompiled = precompile(singlePage);
    expect(precompiled.pages).toHaveLength(1);
    const page = precompiled.pages[0];
    removePositions(page.root);
    expect(page.root).toEqual(u('root', [u('heading', { depth: 1 }, [u('text', 'Hello')]), u('paragraph', [u('text', 'how are you?')])]));
    expect(page.num).toEqual(1);
    expect(page.metadata).toEqual({});
    expect(precompiled.frontmatter).toEqual({});
  });

});
