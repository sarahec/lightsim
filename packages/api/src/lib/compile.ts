/*
 Copyright 2023 Google LLC

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
import { CompiledSimulation } from '@lightsim/runtime';

import { loadFile } from './file_io';

/**
 * Load the specified file, then compile it. If the file isn't found, the promise will be rejected.
 * 
 * @param filename the file to load
 * @returns a promise that resolves to the compiled simulation or contains the error.
 */
export async function compileFile(filename: string): Promise<CompiledSimulation> {
  return loadFile(filename).then(compile);
}
