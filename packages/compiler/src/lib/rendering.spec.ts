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

import { toHTML, toMarkdown } from './rendering';

describe('renderer', () => {
  const tree = u('root', [u('heading', { depth: 1 }, [u('text', 'Hello')])]);

  it('renders HTML', () => {
    const file = toHTML(tree as Root, {count: 0, prefix: 'test'});

    expect(file.basename).toBe('test.html'); // 0 is elided
    expect(file.value).toBe('<h1>Hello</h1>');
  });

  it('renders Markdown', () => {
    const file = toMarkdown(tree as Root, {count: 1, prefix: 'test'});
    expect(file.basename).toBe('test1.md');
    expect(file.value).toBe('# Hello\n');
  });
});
