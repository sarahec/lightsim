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
import { type Root } from 'mdast';

import { toHTML, toMarkdown } from '../render';
import { ILogObj, Logger } from 'tslog';
import { Environment, Template } from 'nunjucks';

const logger = new Logger({name: 'test', minLevel: 3}) as Logger<ILogObj>;
const template = new Template('TEST:: {{contents}}', new Environment(null, {autoescape: false}));

describe('render', () => {
  const tree = u('root', [u('heading', { depth: 1 }, [u('text', 'Hello')])]);

  it('renders a HTML fragment by default', () => {
    const file = toHTML(tree as Root, {count: 0, name: 'test', log: logger});
    expect(file.basename).toBe('test.html'); // count == 0 is elided
    expect(file.value).toBe('<h1>Hello</h1>');
  });

  it('renders HTML into a template', () => {
    const file = toHTML(tree as Root, {count: 0, name: 'test', template: template, log: logger});
    expect(file.basename).toBe('test.html'); // count == 0 is elided
    expect(file.value).toBe("TEST:: <h1>Hello</h1>");
  });

  it('renders Markdown', () => {
    const file = toMarkdown(tree as Root, {count: 1, name: 'test'});
    expect(file.basename).toBe('test1.md');
    expect(file.value).toBe('# Hello');
  });

  describe('with metadata', () => {
    let treeWithFrontmatter: Root;
    let treeWithPageMetadata: Root;
    const globalMetadata = { title: 'Test', foo: 'bar' };
    const pageMetadata = { title: 'Page' };
    
    beforeEach(() => {
      treeWithFrontmatter = u('root', {meta: globalMetadata},  [
        u('heading', { depth: 1 }, [u('text', 'Hello')]),
      ]) as Root;
      treeWithPageMetadata = u('root', {meta: globalMetadata},  [
        u('heading', { depth: 1, meta: { scope: 'page', ...pageMetadata } }, [u('text', 'Hello')]),
      ]) as Root;
    });

    it('captures frontmatter when rendering html', () => {
      const file = toHTML(treeWithFrontmatter, { count: 1, name: 'test' }, globalMetadata);
      // @ts-expect-error extra fields are permitted. We add `metadata`.
      expect(file.metadata).toEqual(globalMetadata);
    });

    it('captures frontmatter when rendering markdown', () => {
      const file = toMarkdown(treeWithFrontmatter, { count: 1, name: 'test' }, globalMetadata);
      // @ts-expect-error extra fields are permitted. We add `metadata`.
      expect(file.metadata).toEqual(globalMetadata);
    });

    it('captures page metadata when rendering html', () => {
      const file = toHTML(treeWithPageMetadata, { count: 1, name: 'test' });
      // @ts-expect-error extra fields are permitted. We add `metadata`.
      expect(file.metadata).toEqual(pageMetadata);
    });

    it('captures page metadata when rendering markdown', () => {
      const file = toMarkdown(treeWithPageMetadata, { count: 1, name: 'test' });
      // @ts-expect-error extra fields are permitted. We add `metadata`.
      expect(file.metadata).toEqual(pageMetadata);
    });

    it('merges page metadata when rendering html', () => {
      const file = toHTML(treeWithPageMetadata, { count: 1, name: 'test' }, globalMetadata);
      // @ts-expect-error extra fields are permitted. We add `metadata`.
      expect(file.metadata).toEqual({ ...globalMetadata, ...pageMetadata });
    });

    it('merges page metadata when rendering markdown', () => {
      const file = toMarkdown(treeWithPageMetadata, { count: 1, name: 'test' }, globalMetadata);
      // @ts-expect-error extra fields are permitted. We add `metadata`.
      expect(file.metadata).toEqual({ ...globalMetadata, ...pageMetadata });
    });

  });

});
