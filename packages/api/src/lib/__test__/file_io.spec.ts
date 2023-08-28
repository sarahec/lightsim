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

import { loadFile } from '../file_io';

describe('file_io', () => {
  it('should read a file', async () => {
    const file = await loadFile('content.md');
    expect(file.messages).toHaveLength(0);
    expect(file.value).toContain('This is a test');
  });

  it('should return a proxy for a missing file', async () => {
    const file = await loadFile('no-such-file.md');
    expect(file.messages).toHaveLength(1);
    expect(file.messages[0].reason).toContain('ENOENT');
    expect(file.value).toBeUndefined();
  });
});
