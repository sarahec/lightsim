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

import { Root } from 'mdast';
import { ILogObj, Logger } from 'tslog';
import { type Node } from 'unist';
import { u } from 'unist-builder';
import { CONTINUE, visit } from 'unist-util-visit';
import { VFile } from 'vfile';
import precompile, { collectNodesOfInterest, collectPageRoots, extractGlobalMetadata } from '../precompiler.js';
import makeMatchFn from '../util/matcher.js';

const log = new Logger({ name: 'test_precompiler', minLevel: 3 }) as Logger<ILogObj>;

const removePositions = (tree: Node) => visit(tree, node => { delete node['position']; return CONTINUE; });

describe('precompiler', () => {

  it('should export a single page', async () => {
    const singlePage = new VFile({
      path: 'test.md',
      value: '# Hello\n\nhow are you?\n',
    });
    const precompiled = precompile(singlePage, { log: log });
    expect(precompiled.pages).toHaveLength(1);
    const page = precompiled.pages[0];
    removePositions(page.root);
    expect(page.root).toEqual(u('root', [u('heading', { depth: 1 }, [u('text', 'Hello')]), u('paragraph', [u('text', 'how are you?')])]));
    expect(page.metadata).toEqual({});
    expect(precompiled.frontmatter).toEqual({});
  });

  it('should export frontmatter', async () => {
    const singlePage = new VFile({
      path: 'test.md',
      value: '---\ntitle: Hello\n---\n\n# Hello\n\nHow are you?',
    });
    const precompiled = precompile(singlePage, { log: log });
    expect(precompiled.pages).toHaveLength(1);
    const page = precompiled.pages[0];
    removePositions(page.root);
    expect(page.root).toEqual(u('root', [u('heading', { depth: 1 }, [u('text', 'Hello')]), u('paragraph', [u('text', 'How are you?')])]));
    expect(page.metadata).toEqual({});
    expect(precompiled.frontmatter).toEqual({ title: 'Hello' });
  });

  it.skip('should export directives', async () => {
    const singlePage = new VFile({
      path: 'test.md',
      value: '---\ntitle: Hello\n---\n\n# Hello\n\n::title[Hi]\n\nHow are you?',
    });
    const precompiled = precompile(singlePage, { log: log });
    expect(precompiled.pages).toHaveLength(1);
    const page = precompiled.pages[0];
    removePositions(page.root);
    expect(page.root).toEqual(u('root', [u('heading', { depth: 1, meta: { title: 'Hi' } }, [u('text', 'Hello')]), u('paragraph', [u('text', 'How are you?')])]));
    expect(page.metadata).toEqual({ title: 'Hi' });
    expect(precompiled.frontmatter).toEqual({ title: 'Hello' });
  });

  describe('implementation', () => {
    // I know, "don't test implementation details", but this has many steps and they 
    // need to be correct
    const matchDirectives = makeMatchFn('leafDirective');
    const matchDestination = makeMatchFn('heading');

    it('should find headings and metadata', async () => {
      const mdast = u('root', [u('yaml', { value: 'title: Hello' }), u('heading', { depth: 1 }, [u('text', 'Hello')]), u('paragraph', [u('text', 'how are you?')])]) as Root;
      const scannedNodes = collectNodesOfInterest(mdast, matchDirectives, matchDestination, log);
      expect(scannedNodes).toHaveLength(2); // frontmatter and heading
    });

    it('should extract frontmatter', async () => {
      const mdast = u('root', [u('yaml', { value: 'title: Hello' }), u('heading', { depth: 1 }, [u('text', 'Hello')]), u('paragraph', [u('text', 'how are you?')])]) as Root;
      const scannedNodes = collectNodesOfInterest(mdast, matchDirectives, matchDestination, log);
      const globalMetadata = extractGlobalMetadata(scannedNodes);
      expect(globalMetadata).toEqual({ title: 'Hello' });
    });

    it('should identify the first page', async () => {
      const mdast = u('root', [u('yaml', { value: 'title: Hello' }), u('heading', { depth: 1 }, [u('text', 'Hello')]), u('paragraph', [u('text', 'how are you?')])]) as Root;
      const scannedNodes = collectNodesOfInterest(mdast, matchDirectives, matchDestination, log);
      const pages = collectPageRoots(scannedNodes);
      expect(pages).toHaveLength(1);
      expect(pages[0].heading).toEqual(u('heading', { depth: 1 }, [u('text', 'Hello')]));
    });

  });

});
