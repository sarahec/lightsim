// Copyright 2023 Sarah Clark
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { expect, jest } from '@jest/globals';
import compile from '@lightsim/compiler';
import { glob } from 'glob';
import { read } from 'to-vfile';
import { VFile } from 'vfile';
import rollupPluginLightsim from '../index.js';

describe('rollupPluginLightsim', () => {
  // Generate a Jest mock function for glob
  // https://jestjs.io/docs/mock-functions#mocking-modules

  beforeAll(() => {
    // @ts-expect-error glob is a mock function
    glob.mockResolvedValue(['content/test.md']);
  });

  it('should generate a plugin', async () => {
    const plugin = await rollupPluginLightsim({path: 'content/test.md'});
    expect(plugin).toHaveProperty('name');
    expect(plugin).toHaveProperty('buildStart');
    expect(plugin).toHaveProperty('watchChange');
  });

  it('should add files to watch', async () => {
    const plugin = await rollupPluginLightsim({path: 'content/test.md'});

    const addWatchFile = jest.fn();
    // @ts-expect-error buildStart is a function and thus is callable
    plugin.buildStart?.call({ addWatchFile });
    expect(addWatchFile).toHaveBeenCalledWith('content/test.md');
  });

  it('should compile files on watch change', async () => {
    const source = new VFile({ path: 'content/test.md', value: '# Test' });
    const compiled = new VFile({
      path: 'test.html',
      value: '<h1>Test</h1>',  // NOTE: The compiler emits full HTML docs by default. This value is only for this test.
    });

    const plugin = await rollupPluginLightsim({path: 'content/test.md'});
    // @ts-expect-error read is a mock function
    read.mockResolvedValue(source);
    // @ts-expect-error compile is a mock function
    compile.mockResolvedValue([compiled]);

    const emitFile = jest.fn();
    // @ts-expect-error watchChange is a function and thus is callable
    await plugin.watchChange?.call({ emitFile }, 'content/test.md');

    expect(emitFile).toHaveBeenCalledWith({
      type: 'asset',
      fileName: 'test.html',
      source: '<h1>Test</h1>',
    });
  });
});

jest.mock('glob', () => {
  return {
    glob: jest.fn(),
  };
});

jest.mock('to-vfile', () => {
  return {
    read: jest.fn(),
  };
});

jest.mock('@lightsim/compiler', () => jest.fn());
