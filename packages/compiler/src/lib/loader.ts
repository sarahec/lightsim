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

import { toVFile } from 'to-vfile';
import glob from 'fast-glob';

/**
 * Finds all the files with paths matching the pattern and returns them as VFiles.
 *
 * Note that these VFiles only contain a path, they have no been read in yet.
 *
 * @param includePattern
 * @param excludePattern
 * @returns
 */
export async function findContentFiles(
  includePattern = 'content/**/*.md',
  excludePattern = '_*.md'
) {
  return glob(includePattern, {
    onlyFiles: true,
    absolute: true,
    ignore: [excludePattern],
  }).then((files) => files.map((file) => toVFile(file)));
}
