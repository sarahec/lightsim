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
import findPath from "./util/find";

/** @type {import('unified').Plugin<[Options]>} */
export default function collectMetadata() {
  return (tree:  Node | Parent) => {
    const path = findPath(tree, "yaml");

	return tree;
	};
};



