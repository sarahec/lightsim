import rehypeStringify from "rehype-stringify";
import { type Root } from "mdast";
import { type Root as HastRoot } from "hast";
import remarkRehype from "remark-rehype";
import remarkStringify from "remark-stringify";
import { unified } from "unified";
import { VFile } from 'vfile';

/**
 * Converts a mdast tree to HTML and returns it as a VFile.
 * 
 * @param tree A single markdown tree
 * @param count Suffix for the file name
 * @param prefix Basename for the file
 * @param suffix File extension
 * @returns An in-memory VFile with the file name and HTML
 */
export function toHTML(tree: Root, count=0, prefix='page', suffix = 'html'){
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
export function toMarkdown(tree: Root, count=0, prefix='page', suffix = 'md') {
  const markdown = unified()
    .use(remarkStringify)
    .stringify(tree);
  return makeVFile(markdown, suffix, count, prefix);
}

export function makeVFile(value: string, suffix: string, count=1, prefix='page') {
  const filename = (count ?`${prefix}${count}` : prefix) + '.' + suffix;
  return new VFile({basename: filename, value: value});
}