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
import { Template } from 'nunjucks';
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

/**
 * Options for rendering a markdown tree to a file.
 * 
 * @param name Basename for the file (default: 'page')
 * @param count Number between the name and extension, e.g. page*1*.html (unused if unspecified or 0) 
 * @param extension File extension (default: matches output format)
 * @param asHTMLDocument Whether to wrap HTML in a document (default: false, create a fragment)
 * @param format Whether to render as HTML or markdown
 * @param log Logger to use for logging
 */

export interface RenderOptions {
  readonly name?: string;
  readonly count?: number;
  readonly extension?: string;
  readonly template?: Template;
  readonly format?: FileFormat | string;
  readonly log?: Logger<ILogObj>;
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
 * @returns An in-memory VFile
 */
export function toHTML(tree: Root, options?: RenderOptions) {
  const { count = 0, name: name = 'page', extension: suffix = 'html' } = options || {};
  const log =
    options?.log?.getSubLogger({ name: HTML_LOGGER_NAME }) ??
    new Logger({ name: HTML_LOGGER_NAME, minLevel: 3 });
  const hast = unified().use(remarkRehype).runSync(tree) as HastRoot;
  log.silly(`HAST: ${JSON.stringify(hast)}`);
  const html = unified().use(rehypeStringify).stringify(hast).trim();
  log.silly(`HTML: ${html}`);

  const finalHTML = options?.template?.render({ contents: html, title: name, }) ?? html;
  return makeVFile(finalHTML, suffix, count, name, log);
}

/**
 * Renders a mdast tree to markdown and returns it as a VFile.

 * @param tree A single markdown tree
 * @returns An in-memory VFile
 */
export function toMarkdown(tree: Root, options?: RenderOptions) {
  const { count = 0, name: name = 'page', extension: suffix = 'md' } = options || {};
  const log =
    options?.log?.getSubLogger({ name: MD_LOGGER_NAME }) ??
    new Logger({ name: MD_LOGGER_NAME, minLevel: 3 });
  const markdown = unified().use(remarkStringify).stringify(tree).trim();
  return makeVFile(markdown, suffix, count, name);
}

/**
 * Utility to make a VFile
 * @param data contents
 * @param extension file extension
 * @param count optional sequence number (ignored if 0, default 1)
 * @param name base filename (default: 'page')
 * @param log logger
 * @returns an in-memory VFile
 */
export function makeVFile(
  data: string,
  extension: string,
  count = 1,
  name = 'page',
  log?: Logger<ILogObj>
): VFile {
  const filename = (count ? `${name}${count}` : name) + '.' + extension;
  log?.trace(`New file: ${filename}`);
  return new VFile({ basename: filename, value: data });
}
