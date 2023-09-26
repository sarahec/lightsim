#!/usr/bin/env node

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


import compile from '@lightsim/compiler';
import { Command } from 'commander';
import * as fs from 'fs';
import * as process from 'process';
import { readSync } from 'to-vfile';
import { ILogObj, Logger } from 'tslog';
import { VFile } from 'vfile';

const program = new Command();

function main() {
  const log = new Logger<ILogObj>({ name: 'lsc' });

  program
    .name('lsc')
    .description('Builds simulation apps from markdown files')
    .version('0.1.0');

  program
    .command('compile')
    .argument('file', 'source file')
    .option('--dry-run', 'do not write files', false)
    // .option('--verbose', 'output debug logs', false)
    .option('--output <name>', 'the output directory', 'sim')
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .action((path, options) => {
      if (path && !fs.existsSync(path)) {
        program.error(`file not found: ${path}`);
      }
      const source: VFile = readSync(path);
      const generated = compile(source);
      log.debug(`Compiler generated ${generated.pages.length} files`);
    });

  program.parse(process.argv);
}

main();
