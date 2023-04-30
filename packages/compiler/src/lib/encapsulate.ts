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

import { type Parent, type Node } from 'unist';
import { VFile } from 'vfile';

type MatchFn = (probe: Node) => boolean;
type WrapFn = (nodes: Node[], count?: number, matched?: Node) => Parent;

type MatcherType = string | Node | MatchFn;
type WrapperType = string | Node | WrapFn;
export interface EncapsulateOptions {
  match: MatcherType;
  wrap: WrapperType;
}

/**
 * Split a tree into multiple sections based on a predicate
 * then wrap in a user-defined container.
 */
/** @type {import('unified').Plugin<[Options]>} */
export function group(options: EncapsulateOptions) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const matcher = makeMatchFn(options.match);
  const wrapper = makeWrapFn(options.wrap);

  return (tree: Node, file?: VFile): Node => {
    // No tree? No-op.
    if (!Object.prototype.hasOwnProperty.call(tree, 'children')) return tree;

    const matches: number[] = [];
    (tree as Parent).children.forEach((probe: Node, index: number) => {
      if (matcher(probe)) matches.push(index);
    });
    if (matches.length == 0) return tree;
    const wrappedNodes = matches.map((matchPos, i) => {
      const atEnd = i == matches.length - 1;
      const endIndex = atEnd ? undefined : matches[i + 1];
      return wrapper(
        (tree as Parent).children.slice(matchPos, endIndex),
        i,
        (tree as Parent).children[matchPos]
      );
    });
    const newTree = { ...tree, children: wrappedNodes };
    // @ts-expect-error the type checker doesn't know what to do with the conditional property
    if (tree === file?.data) {
      file.data = newTree;
    }
    return newTree;
  };
}

/**
 * Converts a match specifier (type string, partial node, or function) into a function that can be used to test a node.
 *
 * @param matcher A type string ('foo'), a partial node ({type: 'foo', value: 'bar'}), or a function (node) => boolean.
 */
function makeMatchFn(matcher: MatcherType): MatchFn {
  if (typeof matcher === 'string') {
    return (probe: Node) => probe.type === matcher;
  }
  if (typeof matcher === 'function') {
    return matcher;
  }

  return (probe: Node) => {
    for (const key in matcher) {
      // @ts-expect-error ignore types for this match
      if (probe[key] !== matcher[key]) return false;
    }
    return true;
  };
}

/**
 * Converts a wrapper specifier (type string, partial node, or function) into a wrapper function.
 *
 * @param wrapper A type string ('foo'), a partial node ({type: 'foo', value: 'bar'}), or a function (node) => boolean.
 */
function makeWrapFn(wrapper: WrapperType): WrapFn {
  if (typeof wrapper === 'string') {
    return (nodes: Node[]) => ({ type: wrapper, children: nodes });
  }
  if (typeof wrapper === 'function') {
    return wrapper;
  }

  return (nodes: Node[]) => ({ ...wrapper, children: nodes });
}
