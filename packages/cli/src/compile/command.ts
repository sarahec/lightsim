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

import { Command } from 'commander';
import * as fs from 'fs';
import * as process from 'process';
import { read } from 'to-vfile';
import { printVerboseHook, rootDebug } from '../utils.js';
import { VFile } from 'vfile';
import compile from '@lightsim/compiler';

const debug = rootDebug.extend('compile');
const debugError = rootDebug.extend('compile:error');

export const compileCommand = () => {
  const command = new Command('compile');
  command
    .argument('file', 'source file')
    // .option('--verbose', 'output debug logs', false)
    .option('--output <name>', 'the output directory', 'sim')
    .hook('preAction', printVerboseHook)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .action(async (path, options) => {
      if (path && !fs.existsSync(path)) {
        debugError('invalid path provided');
        process.exit(1);
      }
      const source: VFile = await read(path);
      const generated = await compile(source);
      debug(`Compiler generated ${generated.length} files`);
    });
  return command;
};
