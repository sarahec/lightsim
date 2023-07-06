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

import { type VFile } from 'vfile';

/**
 * One exported page from the precompiler
 * @property format - the format of the page (e.g. markdown)
 * @property title - the title of the page
 * @property file - the file containing the page contents.
 * @property getContents - get the contents of the page as a String
 */
export interface Page {
  readonly format: string;
  readonly title? : string;
  readonly file: VFile;
  getContents(): string;
}

export interface CompiledSimulation {
  readonly pages: Readonly<Page[]>;
}

export interface PageMetadata {
  title?: string;
}
