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

import { Metadata, Page } from '@lightsim/runtime';
import { type Root as HastRoot } from 'hast';
import { freeze } from 'immer';
import { type Root } from 'mdast';
import { Template } from 'nunjucks';
import rehypeStringify from 'rehype-stringify';
import remarkRehype from 'remark-rehype';
import remarkStringify from 'remark-stringify';
import { ILogObj, Logger } from 'tslog';
import { unified } from 'unified';
import { VFile } from 'vfile';
import { extractMetadata } from './metadata';

const HTML_LOGGER_NAME = 'rendering html';
const MD_LOGGER_NAME = 'rendering markdown';

export type FileFormat = 'html' | 'md';

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

export type RenderOptions = {
  readonly name?: string;
  readonly count?: number;
  readonly extension?: string;
  readonly template?: Template;
  readonly format?: FileFormat | string;
  readonly log?: Logger<ILogObj>;
}

export default function render(trees: Root[] | Root, options?: RenderOptions, globalMetadata?: Metadata): Readonly<Readonly<Page>[]> {
  const formatter = options?.format === 'html' ? toHTML : toMarkdown;
  const baseCount = options?.count || 0;
  if (!Array.isArray(trees)) {
    // Single tree
    return [formatter(trees, options, globalMetadata)];
  } else {
    return freeze(trees.map((tree, index) =>
      formatter(tree, { ...options, count: baseCount + index }, globalMetadata)
    ));
  }
}

/**
 * Converts a mdast tree to HTML and returns it as a VFile.
 *
 * @param tree A single markdown tree
 * @returns a Page
 */
export function toHTML(tree: Root, options?: RenderOptions, globalMetadata: Metadata = {}) {
  const { count = 0, name: name = 'page', extension: suffix = 'html' } = options || {};
  const log =
    options?.log?.getSubLogger({ name: HTML_LOGGER_NAME }) ??
    new Logger({ name: HTML_LOGGER_NAME, minLevel: 3 });
  const pageMetadata = extractMetadata(tree, 'page', log);
  const metadata = { ...globalMetadata, ...pageMetadata };
  const hast = unified().use(remarkRehype).runSync(tree) as HastRoot;
  log.silly(`hast: ${JSON.stringify(hast)}`);
  const html = unified().use(rehypeStringify).stringify(hast).trim();
  log.silly(`html: ${html}`);

  const finalHTML = options?.template?.render({ contents: html, title: name, }) ?? html;
  return makePage(finalHTML, suffix, count, name, metadata, log);
}

/**
 * Renders a mdast tree to markdown and returns it as a VFile.
markdown
 * @param tree A single markdown tree
 * @returns a Page
 */
export function toMarkdown(tree: Root, options?: RenderOptions, globalMetadata: Metadata = {}) {
  const { count = 0, name: name = 'page', extension: suffix = 'md' } = options || {};
  const log =
    options?.log?.getSubLogger({ name: MD_LOGGER_NAME }) ??
    new Logger({ name: MD_LOGGER_NAME, minLevel: 3 });
  const pageMetadata = extractMetadata(tree, 'page', log) || {}
  const metadata = { ...globalMetadata, ...pageMetadata };
  const markdown = unified().use(remarkStringify).stringify(tree).trim();
  log.silly(`markdown: ${JSON.stringify(markdown)}`);
  return makePage(markdown, suffix, count, name, metadata, log);
}

/**
 * Utility to make a Page
 * @param data contents
 * @param extension file extension
 * @param count optional sequence number (ignored if 0, default 1)
 * @param name base filename (default: 'page')
 * @param metadata optional metadata to attach to the file
 * @param log logger
 * @returns an Page with an in-memory VFile
 */
function makePage(
  data: string,
  extension: string,
  count = 1,
  name = 'page',
  metadata: Metadata,
  log?: Logger<ILogObj>
): Readonly<Page> {
  const filename = (count ? `${name}${count}` : name) + '.' + extension;
  log?.trace(`New file: ${filename}, metadata: ${JSON.stringify(metadata)}`);
  const file = freeze(new VFile({ basename: filename, value: data }));
  return freeze(
    {
      format: extension, file: file, getContents: () => String(file.value),
      metadata: metadata,
    });
}
