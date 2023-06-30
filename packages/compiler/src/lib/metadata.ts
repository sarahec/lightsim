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

import { type Node, type Parent } from "unist";
import find from "./util/find.js";
import { load } from "js-yaml";

/** @type {import('unified').Plugin<[Options]>} */
export default function collectMetadata() {
  return (tree:  Node | Parent) => {
    // For now, find the first instance and move it to the root
    const path = find(tree, "yaml");
    if (!path) return tree;
    path.remove();
    // @ts-expect-error this node has a value
    const yaml = load(path?.value?.value);
    // @ts-expect-error we can add any property to a node
    tree.frontmatter = yaml;
	  return tree;
	};
};
