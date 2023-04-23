import {type Root, Content, Heading} from 'mdast';
import remarkParse from "remark-parse";
import { unified } from "unified";
import { VFile } from 'vfile';

/**
 * Finds the headings in a markdown tree down to a certain `depth`.
 * 
 * @param tree The root of a mdast tree
 * @param depth How many levels deep to search
 * @returns The found headings
 */
export function findHeadings(tree: Root, depth = 2) {
  return tree.children.filter((node) => node.type == "heading" && node.depth <= depth) as Heading[];
}

/**
 * Splits a mdast tree into multiple trees based on a list of child elements.
 * 
 * Note: This generates all new subtrees, copying the nodes of the original.
 * 
 * @param tree The root of a mdast tree. 
 * @param markers The child elements to split on.
 * @returns a list of mdast trees.
 */
export function splitTree(tree: Root, markers: Content[]) {
  const result: Root[] = [];
  const indices = markers.map((marker) => tree.children.indexOf(marker));
  let startIndex = indices.shift();
  while (indices.length > 0) {
    const endIndex = indices.shift();
    result.push({ type: "root", children: (tree.children.slice(startIndex, endIndex)) });
    startIndex = endIndex;
  }
  result.push({ type: "root", children: (tree.children.slice(startIndex)) });
  return result;
}


export function splitFile(vfile: VFile, depth = 2) {
  const tree = unified().use(remarkParse).parse(vfile);
  const headings = findHeadings(tree, depth);
  return splitTree(tree, headings);
}

