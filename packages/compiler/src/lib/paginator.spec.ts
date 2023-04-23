
import { unified } from 'unified';
import remarkParse from 'remark-parse';

import {findHeadings, splitTree} from './paginator'


test('Extracts single heading', async () => {
    const tree = await unified()
    .use(remarkParse)
    .parse("# Hello");
    const headings = findHeadings(tree);
    
    expect(headings).toHaveLength(1);
});

test('Extracts H1/H2', async () => {
    const tree = await unified()
    .use(remarkParse)
    .parse("# Hello\n\n## World\n\n### Again");
    const headings = findHeadings(tree);
    
    expect(headings).toHaveLength(2);
});


test('Extracts H1/H2, keep H3', async () => {
    const tree = await unified()
        .use(remarkParse)
        .parse("# Hello\n\nPart 1\n\n### World\n\nPart 2\n\n## Again\n\nPart 3");
    const headings = findHeadings(tree, 2);
    
    expect(headings).toHaveLength(2);
    expect(headings[0].depth).toEqual(1);
    expect(headings[1].depth).toEqual(2);

    expect(tree.children.indexOf(headings[0])).toEqual(0);
    expect(tree.children.indexOf(headings[1])).toEqual(4);
});

test('Copies H1', async () => {
    const tree = await unified()
        .use(remarkParse)
        .parse("# Hello\n\nPart 1\n\n### World\n\nPart 2\n\n## Again\n\nPart 3");
    const headings = findHeadings(tree, 1);
    expect(headings).toHaveLength(1);

    const subtrees = splitTree(tree, headings);
    expect(subtrees).toHaveLength(1);
    expect(subtrees[0].children).toHaveLength(6);
    expect(subtrees[0].children[0].type).toEqual("heading");
});

test('Copies H1 and H2', async () => {
    const tree = await unified()
        .use(remarkParse)
        .parse("# Hello\n\nPart 1\n\n### World\n\nPart 2\n\n## Again\n\nPart 3");
    const headings = findHeadings(tree, 2);
    expect(headings).toHaveLength(2);

    const subtrees = splitTree(tree, headings);
    expect(subtrees).toHaveLength(2);
    expect(subtrees[0].children).toHaveLength(4); //  Hello\n\nPart 1\n\n### World\n\nPart 2
    expect(subtrees[0].children[0].type).toEqual("heading");
    expect(subtrees[1].children).toHaveLength(2); //## Again\n\nPart 3"
});


