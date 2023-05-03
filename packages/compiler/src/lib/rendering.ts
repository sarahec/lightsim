import rehypeStringify from "rehype-stringify";
import { type Root } from "mdast";
import { type Root as HastRoot } from "hast";
import remarkRehype from "remark-rehype";
import remarkStringify from "remark-stringify";
import { unified } from "unified";
import { VFile } from 'vfile';

export enum FileFormat {
  HTML = 'html',
  Markdown = 'md',
}
export interface RenderOptions {
  count?: number;
  prefix?: string;
  suffix?: string;
  format?: FileFormat;
};

export function render(trees: (Root[] | Root), options?: RenderOptions): VFile[] {
  const formatter = options?.format === FileFormat.HTML ? toHTML : toMarkdown;
  const baseCount = options?.count || 0;
    if (!Array.isArray(trees)) {
      return [(formatter(trees, options))];
    } else {
      return trees.map((tree, index) => formatter(tree, {...options, count: baseCount + index }));
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
export function toHTML(tree: Root, options?: RenderOptions){
  const {
    count = 0,
    prefix = 'page',
    suffix = 'html',
  } = options || {};
  const hast = unified()
    .use(remarkRehype)
    .runSync(tree) as HastRoot;
  const html = unified()
    .use(rehypeStringify)
    .stringify(hast);
    return makeVFile(html, suffix, count, prefix);
  }

/**
 * Renders a mdast tree to markdown and returns it as a VFile.

 * @param tree A single markdown tree
 * @param count Suffix for the file name
 * @param prefix Basename for the file
 * @param suffix File extension
 * @returns An in-memory VFile with the file name and markdown
 */
export function toMarkdown(tree: Root, options?: RenderOptions){
  const {
    count = 0,
    prefix = 'page',
    suffix = 'md',
  } = options || {};
  const markdown = unified()
    .use(remarkStringify)
    .stringify(tree);
  return makeVFile(markdown, suffix, count, prefix);
}

export function makeVFile(value: string, suffix: string, count=1, prefix='page') {
  const filename = (count ?`${prefix}${count}` : prefix) + '.' + suffix;
  return new VFile({basename: filename, value: value});
}