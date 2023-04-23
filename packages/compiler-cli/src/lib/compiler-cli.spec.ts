import { compilerCli } from './compiler-cli';

describe('compilerCli', () => {
  it('should work', () => {
    expect(compilerCli()).toEqual('compiler-cli');
  });
});
