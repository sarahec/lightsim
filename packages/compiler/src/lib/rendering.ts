import rehypeStringify from "rehype-stringify";
import * as Remark  from "remark-parse/lib";
import * as Hast from 'hast'
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
export function toHTML(tree: Remark.Root, count=1, prefix='page', suffix = 'html'){
  const hast = unified()
    .use(remarkRehype)
    .runSync(tree);
  const html = unified()
    .use(rehypeStringify)
    .stringify((hast as Hast.Root));
  return new VFile({path: `${prefix}${count}.${suffix}`, value: html});
}

/**
 * Renders a mdast tree to markdown and returns it as a VFile.

 * @param tree A single markdown tree
 * @param count Suffix for the file name
 * @param prefix Basename for the file
 * @param suffix File extension
 * @returns An in-memory VFile with the file name and markdown
 */
export function toMarkdown(tree: Remark.Root, count=1, prefix='page', suffix = 'md') {
  const markdown = unified()
    .use(remarkStringify)
    .stringify(tree);
  return new VFile({path: `${prefix}${count}.${suffix}`, value: markdown});
}

