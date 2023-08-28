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

import { compileFile } from '../compile.js';

describe('compiling', () => {
  it('should compile an existing file', async () => {
    const result = await compileFile('content.md');
    expect(result.pages).toHaveLength(4);
  });

  it('should return a proxy for a missing file', async () => {
    const result = await compileFile('no-such-file.md');
    expect(result).toEqual({ 'id': 'no-such-file.md', metadata: {}, pages: [] });
  });

});

