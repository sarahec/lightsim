import { VFile } from 'vfile';
import { compiler } from './compiler';
import { FileFormat } from './rendering';

describe('compiler', () => {
  it('Should compile a single page', async () => {
    const source = new VFile({
      path: 'test.md',
      value: '# Hello World!',
    });
    const files = await compiler(source, {
      render: { format: FileFormat.HTML },
    });
    expect(files).toHaveLength(1); // TODO Should be 1, fix after implementing compile
    const file: VFile = files[0];
    expect(file.value).toEqual('<h1>Hello World!</h1>');
    expect(file.path).toEqual('page.html');
  });
});
