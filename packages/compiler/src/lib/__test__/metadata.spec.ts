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

import { freeze } from "immer";
import { unified } from "unified";
import { u } from "unist-builder";
import collectMetadata from "../metadata.js";

describe('metadata plugin', () => {
	it('should make no change if nothing found', () => {
		const emptyTree = u('root', []);
		const result = unified().use(collectMetadata).runSync(emptyTree);
		expect(result).toEqual(emptyTree);
	});
	  
	describe('with frontmatter', () => {
		it('should parse as yaml', () => {
			const titleTree = freeze(u('root', [u('yaml', "title: This is a test"), u('text', 'hello')]), true);
			const result = unified().use(collectMetadata).runSync(titleTree);
			expect(result).toEqual(u('root', { meta: { title: "This is a test" } }, [u('text', 'hello')]));
		});
	});
});	  
