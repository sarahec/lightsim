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
import { hoistMetadata, type MetadataOptions, extractMetadata, parseDirective, hoistDirectives } from "../metadata.js";

const log = new Logger({ minLevel: 0 });

const optionsLogger = { log: log } as MetadataOptions;

describe('parseDirective', () => {
	it('should parse a directive', () => {
		const directive = u('leafDirective', { name: 'title' }, [u('text', "This is a test")]);
		const result = parseDirective(directive);
		expect(result).toEqual({ title: 'This is a test' });
	});
});

describe('hoistDirectives', () => {
	it('should hoist a directive', () => {
		const titleTree = u('root', [
			u('heading', { depth: 1 }, [u('text', 'First line')]),
			u('leafDirective', { name: 'title' }, [u('text', "This is a test")]),
			u('paragraph', [u('text', 'hello')])]) as Root;
		const expected = u('root', [
			u('heading', {
				depth: 1, meta: { title: 'This is a test' }
			}, [u('text', 'First line')]),
			u('paragraph', [u('text', 'hello')])]) as Root;
		const result = hoistDirectives(titleTree, undefined, undefined, log);
		expect(result).toEqual(expected);
	});
});

describe.skip('hoistMetadata', () => {
	it('should make no change if nothing found', () => {
		const emptyTree = u('root', []);
		const result = unified().use(hoistMetadata, optionsLogger).runSync(emptyTree);
		expect(result).toEqual(emptyTree);
	});

	describe('with frontmatter', () => {
		it('should parse as yaml', () => {
			const titleTree = freeze(u('root', [u('yaml', "title: This is a test"), u('text', 'hello')]), true);
			const result = unified().use(hoistMetadata, optionsLogger).runSync(titleTree);
			expect(result).toEqual(u('root', { meta: { title: 'This is a test', scope: 'global' } }, [u('text', 'hello')]));
		});
	});

	describe('with directives', () => {
		it('should hoist directives to the heading', () => {
			const titleTree = u('root', [
				u('heading', { depth: 1 }, [u('text', 'First line')]),
				u('leafDirective', { name: 'title' }, [u('text', "This is a test")]),
				u('paragraph', [u('text', 'hello')])
			]);
			const result = unified().use(hoistMetadata, optionsLogger).runSync(titleTree);
			expect(result).toEqual(u('root', [
				u('heading', { depth: 1, meta: { title: 'This is a test', } }, 'First line'),
				u('paragraph', [u('text', 'hello')])
			]));
		});
	});
});

describe('extractMetadata', () => {
	it('should find global data (frontmatter)', () => {
		const treeWithFrontmatter = u('root', { meta: { title: "This is a test", scope: 'global' } }, [u('text', 'hello')])
		const result = extractMetadata(treeWithFrontmatter, 'global');
		expect(result).toEqual({ title: "This is a test" });
	});

	it('should find page data (directives)', () => {
		const treeWithDirectives = u('root',
			[u('heading', { depth: 1, meta: { title: "This is a test", scope: 'page' } }, 'First line'), u('text', 'hello')]) as Root;
		const result = extractMetadata(treeWithDirectives, 'page');
		expect(result).toEqual({ title: "This is a test" });
	});

});

// Uncomment block to display a parsed tree before metadata processing
/*

// import remarkDirective from "remark-directive";
// import remarkFrontmatter from "remark-frontmatter";
// import remarkParse from "remark-parse";

describe('from markdown', () => {
	const markdown = `---\ntitle: Frontmatter\n---\n# Hello\n::title[Page 1]\n## World!\n\n::title[Page 2]\n### How are you?`;
	const mdast = unified().use(remarkParse).use([remarkFrontmatter, remarkDirective]).parse(markdown);
	it('should parse', () => {
		expect(mdast).toBeTruthy();
		console.log(JSON.stringify(mdast, null, 2));
	});
});
*/