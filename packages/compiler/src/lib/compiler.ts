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

import { type CompiledSimulation } from '@lightsim/runtime';
import { freeze } from 'immer';
import { ILogObj, Logger } from 'tslog';
import { VFile } from 'vfile';
import precompile from './precompiler.js';
import render, { type RenderOptions } from './render.js';

const LOGGER_NAME = 'compiler';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export type CompileOptions = {
  readonly render?: RenderOptions;
  readonly log?: Logger<ILogObj>;
};

/**
 * Compiles and formats a list of VFiles.
 *
 * @param source A single markdown page
 * @param options Options for the compiler
 * @param logger A parent logger or or `null` to create a new one
 * @returns New VFiles with the compiled content (potentially multiple per source)
 */

export function compile(
  source: VFile,
  options?: CompileOptions,
): Readonly<CompiledSimulation> {
  const log =
    options?.log?.getSubLogger({ name: LOGGER_NAME }) ??
    new Logger({ name: LOGGER_NAME, minLevel: 3 });

  const renderConfiguration: RenderOptions = {
    format: 'html',
    log: log,
    ...options?.render,
  };

  log.trace('compiling', source.path);

  const precompiled = precompile(source, { log: log });
  const pages = render(precompiled, renderConfiguration);

  return freeze({ pages: pages });
}
