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

import { readFile, realpath } from 'node:fs/promises';
import process from 'node:process';
import { VFile } from 'vfile';

/**
 * Reads a file from disk. *NOTE*: This does not throw on error, but instead returns a VFile with the error in `messages`.
 *
 * @param filename Reads a file from disk
 * @param localPath The path to the directory, relative to the root of the project
 * @returns a new VFile. If there was an error, `value` will be undefined and `messages` will contain the error.
 */
export async function loadFile(
  filename: string,
  localPath = 'packages/api/src/assets',
): Promise<VFile> {
  const cwd = process.cwd();
  // FIXME we need to ensure the filename is legal (e.g. not a device)
  return realpath(`${cwd}/${localPath}/${filename}`)
    .then((path) => readFile(path, { encoding: 'utf8' }))
    .then(
      (text) => new VFile({ value: text, path: filename }),
      (err: Error) => {
        const file = new VFile({ path: filename });
        file.message(err.message);
        return file;
      },
    );
}
