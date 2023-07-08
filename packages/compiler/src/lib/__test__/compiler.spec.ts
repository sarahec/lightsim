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

import { VFile } from 'vfile';
import { compile } from '../compiler.js';

describe('compiler', () => {

  it('should export multiple pages from one source', async () => {
    const multiPage = new VFile({
      path: 'test.md',
      value: `# Hello\n\n## World!\n\n### How are you?`,
    });
    const compiled = await compile(multiPage, {
      render: { format: 'md' },
    });
    const files = compiled.pages.map((page) => page.file);
    expect(files).toHaveLength(2);
    expect(files[0].value).toEqual('# Hello');
    expect(files[0].path).toEqual('page.md');
    expect(files[1].value).toEqual('## World!\n\n### How are you?');
    expect(files[1].path).toEqual('page1.md');
  });

  it('Should export frontmatter as metadata', async () => {
    const multiPage = new VFile({
      path: 'test.md',
      value: `---\ntitle: Hello world\n---\n# Hello\n\n## World!\n\n### How are you?`,
    });
    const html = await compile(multiPage, {
      render: { format: 'html' },
    });
    const md = await compile(multiPage, {
      render: { format: 'md' },
    });
    expect(html.pages.at(0)?.metadata).toEqual({ title: 'Hello world' });
    expect(html.pages.at(1)?.metadata).toEqual({ title: 'Hello world' });
    expect(md.pages.at(0)?.metadata).toEqual({ title: 'Hello world' });
    expect(md.pages.at(1)?.metadata).toEqual({ title: 'Hello world' });
  });

});
