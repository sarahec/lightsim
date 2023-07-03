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
import { Root } from "mdast";
import { Logger } from "tslog";
import { unified } from "unified";
import { u } from "unist-builder";
import collectMetadata, { MetadataOptions } from "../metadata.js";

const log = new Logger({ minLevel: 3 });

const optionsLogger = { log: log } as MetadataOptions;

describe('metadata plugin', () => {
	it('should make no change if nothing found', () => {
		const emptyTree = u('root', []);
		const result = unified().use(collectMetadata, optionsLogger).runSync(emptyTree);
		expect(result).toEqual(emptyTree);
	});
	  
	describe('with frontmatter', () => {
		it('should parse as yaml', () => {
			const titleTree = freeze(u('root', [u('yaml', "title: This is a test"), u('text', 'hello')]), true);
			const result = unified().use(collectMetadata, optionsLogger).runSync(titleTree);
			expect(result).toEqual(u('root', { meta: { title: "This is a test" } }, [u('text', 'hello')]));
		});
	});

	describe('with directives', () => {
		it('should hoist directives to the heading', () => {
			const titleTree = u('root', [u('heading', { depth: 1 }, 'First line'), u('textDirective', { name: 'title', attributes: "This is a test", }), u('text', 'hello')]) as Root;
			const result = unified().use(collectMetadata, optionsLogger).runSync(titleTree);
			expect(result).toEqual(u('root', [u('heading', { depth: 1, meta: { title: 'This is a test' } }, 'First line'), u('text', 'hello')]));
		});
	});
});
