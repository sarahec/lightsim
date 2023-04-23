import remarkParse from 'remark-parse';
import { unified } from 'unified';


import { toHTML, toMarkdown } from './rendering';


test('Renders HTML heading', () => {
    const tree = unified()
    .use(remarkParse)
    .parse("# Hello\n\n");
    
    const file = toHTML(tree, 1, 'test');
    
    expect(file.basename).toBe('test1.html');
    expect(file.value).toBe('<h1>Hello</h1>');
});

test('Renders Markdown heading', () => {
    const tree = unified()
    .use(remarkParse)
    .parse("# Hello\n\n");
    
    const file = toMarkdown(tree, 1, 'test');

    expect(file.basename).toBe('test1.md');
    expect(file.value).toBe('# Hello\n');
});


