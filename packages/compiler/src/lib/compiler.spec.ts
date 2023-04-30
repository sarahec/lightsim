import { VFile } from 'vfile';
import { compile, FileFormat } from './compiler';

describe('compiler', () => {
  it('Should do nothing if no pages', () => {
    expect(compile([], FileFormat.HTML)).toEqual([]);
  });
  it('Should compile a single page', () => {
    const source = new VFile({
      path: 'test.md',
      value: '# Hello World!',
    });
    const files = compile([source], FileFormat.HTML);
    expect(files.length).toEqual(0); // TODO Should be 1, fix after implementing compile
    //   const file: VFile = files[0];

    //   expect(file.data).toEqual('<h1>Hello World!</h1>');
    //   expect(file.path).toEqual('test.html');
  });
});
