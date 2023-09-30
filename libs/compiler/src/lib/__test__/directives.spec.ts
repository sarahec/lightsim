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

import { ILogObj, Logger } from 'tslog';
import { u } from 'unist-builder';
import parseDirective from '../directives.js';

const log = new Logger<ILogObj>({ minLevel: 3 });

describe('parseDirective', () => {
  it('should parse a leaf directive', () => {
    const directive = u('leafDirective', { name: 'title' }, [
      u('text', 'This is a test'),
    ]);
    const result = parseDirective(directive, log);
    expect(result).toEqual({ title: 'This is a test' });
  });
});
