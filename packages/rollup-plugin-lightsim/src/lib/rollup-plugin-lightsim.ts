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

import { compile } from '@lightsim/compiler';
import { glob } from 'glob';
import { type Plugin } from 'rollup';
import { read } from 'to-vfile';

export async function rollupPluginLightsim(
  sourceGlob: string,
): Promise<Plugin> {
  const sources = await glob(sourceGlob);
  return {
    name: 'lightsim-compiler',
    buildStart() {
      sources.forEach((file: string) =>  { this.addWatchFile(file); });
    },
    async watchChange(id) {
      if (sources.includes(id)) {
        // construct a new VFile by reading the file from disk
        const source = await read(id);
        const generated = await compile(source);
        generated.forEach((file) => { 
          this.emitFile({type: 'asset', fileName: file.basename, source: String(file.value)}); });
      }
    },
  };
}

