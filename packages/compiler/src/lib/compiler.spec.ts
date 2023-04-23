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
    const expected = new VFile({
      path: 'page1.html',
      value: '<h1>Hello World!</h1>',
    });
    expect(compile([source], FileFormat.HTML)).toEqual([expected]);
  });
});
