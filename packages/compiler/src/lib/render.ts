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

import { type Root as HastRoot } from 'hast';
import { type Root } from 'mdast';
import rehypeDocument from 'rehype-document';
import rehypeStringify from 'rehype-stringify';
import remarkRehype from 'remark-rehype';
import remarkStringify from 'remark-stringify';
import { ILogObj, Logger } from 'tslog';
import { unified } from 'unified';
import { VFile } from 'vfile';

const HTML_LOGGER_NAME = 'rendering html';
const MD_LOGGER_NAME = 'rendering markdown';

export enum FileFormat {
  HTML = 'html',
  Markdown = 'md',
}
export interface RenderOptions {
  count?: number;
  prefix?: string;
  suffix?: string;
  format?: FileFormat;
  log?: Logger<ILogObj>;
}

export function render(trees: Root[] | Root, options?: RenderOptions): VFile[] {
  const formatter = options?.format === FileFormat.HTML ? toHTML : toMarkdown;
  const baseCount = options?.count || 0;
  if (!Array.isArray(trees)) {
    return [formatter(trees, options)];
  } else {
    return trees.map((tree, index) =>
      formatter(tree, { ...options, count: baseCount + index })
    );
  }
}

/**
 * Converts a mdast tree to HTML and returns it as a VFile.
 *
 * @param tree A single markdown tree
 * @param count Suffix for the file name
 * @param prefix Basename for the file
 * @param suffix File extension
 * @returns An in-memory VFile with the file name and HTML
 */
export function toHTML(tree: Root, options?: RenderOptions) {
  const { count = 0, prefix = 'page', suffix = 'html' } = options || {};
  const log =
    options?.log?.getSubLogger({ name: HTML_LOGGER_NAME }) ??
    new Logger({ name: HTML_LOGGER_NAME, minLevel: 3 });
  const hast = unified()
    .use(remarkRehype)
    .use(rehypeDocument, { title: 'TBD' })
    .runSync(tree) as HastRoot;
  const html = unified().use(rehypeStringify).stringify(hast).trim();
  return makeVFile(html, suffix, count, prefix, log);
}

/**
 * Renders a mdast tree to markdown and returns it as a VFile.

 * @param tree A single markdown tree
 * @param count Suffix for the file name
 * @param prefix Basename for the file
 * @param suffix File extension
 * @returns An in-memory VFile with the file name and markdown
 */
export function toMarkdown(tree: Root, options?: RenderOptions) {
  const { count = 0, prefix = 'page', suffix = 'md' } = options || {};
  const log =
    options?.log?.getSubLogger({ name: MD_LOGGER_NAME }) ??
    new Logger({ name: MD_LOGGER_NAME, minLevel: 3 });
  const markdown = unified().use(remarkStringify).stringify(tree).trim();
  return makeVFile(markdown, suffix, count, prefix);
}

export function makeVFile(
  value: string,
  suffix: string,
  count = 1,
  prefix = 'page',
  log?: Logger<ILogObj>
): VFile {
  const filename = (count ? `${prefix}${count}` : prefix) + '.' + suffix;
  log?.trace(`New file: ${filename}`);
  log?.silly(`...contents: ${value}`);
  return new VFile({ basename: filename, value: value });
}
