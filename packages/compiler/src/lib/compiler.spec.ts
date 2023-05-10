import { VFile } from 'vfile';
import { compile } from './compiler.js';
import { FileFormat } from './rendering.js';

describe('compiler', () => {

  const singlePage = new VFile({
    path: 'test.md',
    value: '# Hello World!',
  });

  it('Should compile a single page to HTML', async () => {
    // TODO Parse and example the HTML rather than hard-coding it (which is fragile).
    const doc = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>TBD</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
<h1>Hello World!</h1>
</body>
</html>`;
    const files = await compile(singlePage, {
      render: { format: FileFormat.HTML },
    });
    expect(files).toHaveLength(1);
    const file: VFile = files[0];
    expect(file.value).toEqual(doc);
    expect(file.path).toEqual('page.html');
  });

  it('Should compile a single page to Markdown', async () => {
    const files = await compile(singlePage, {
      render: { format: FileFormat.Markdown },
    });
    expect(files).toHaveLength(1);
    const file: VFile = files[0];
    expect(file.value).toEqual('# Hello World!');
    expect(file.path).toEqual('page.md');
  });

});
