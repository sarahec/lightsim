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


import * as fs from "fs";  
import { Command }  from 'commander';  
import { printVerboseHook, rootDebug } from '../utils.js';  
import * as process from "process";  
    
const debug = rootDebug.extend('compile')  
const debugError = rootDebug.extend('compile:error')  
  
export const compileCommand = () => {  
  const command = new Command('compile');  
  command  
    .argument('[path]', "directory to do something with")  
    .option('--verbose', 'output debug logs',false)  
    .option('--output <name>', 'the output directory', 'sim')  
    // .requiredOption('--includeDirectories', 'copy directories')  
    .hook('preAction', printVerboseHook)  
    .action(async(path, options) => {  
      if (path && !fs.existsSync(path)) {  
        debugError('invalid path provided')  
        process.exit(1)  
      }  
  
      debug(`Something important is happening now....`)  
    });  
  return command;  
}


