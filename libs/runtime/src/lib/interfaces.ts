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

/**
 * One exported page from the precompiler
 * @property sequence - the sequence number of the page
 * @property metadata - the metadata for the page
 * @property format - the format of the page (e.g. markdown)
 * @property getContents - get the contents of the page as a String
 */
export type CompiledPage = {
  readonly sequence: number;
  readonly contents: string;
  readonly metadata: Metadata;
  readonly format: string;
};

/**
 * The compiled simulation
 * @property id - the id of the simulation
 * @property pages - the pages of the simulation
 * @property metadata - the frontmatter of the simulation
 */
export type CompiledSimulation = {
  readonly id: string;
  readonly pages: CompiledPage[];
  readonly metadata: Metadata;
};

export type Metadata = Record<string, string>;
