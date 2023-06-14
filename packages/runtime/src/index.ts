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

import { VFile } from "vfile";

/**
 * Control interface for a session with the simulation. 
 * @property getContents - the contents of the currrent page.
 * @property isComplete - whether the session is complete.
 * @property canPerform - whether the given action can be performed.
 * @property perform - perform the given action.
 * @property isHome - whether the session is at the home page.
 */
export interface RuntimeControls {
    readonly getContents: (location: number) => string;
    readonly getLocation: () => number;
    readonly isComplete: () => boolean;
    canPerform(action: string): boolean;
    perform(action: string): void;
}

export enum NavigationAction {
    Next = "next",
    Back = "back",
    Home = "home",
}

export type CompiledSimulation = VFile[]; 


/**
 * Create the control interface for a simulation.
 * @param sim - a compiled simulation. (See @lightsim/compiler::compile).
 * @returns the control interface.
  */

export default function makeRuntime(sim: CompiledSimulation): Readonly<RuntimeControls> {
  const _sim = sim;
  let _index = 0;
  const _end = sim.length - 1;

  return Object.freeze({
    getContents: (location: number) => String(_sim[location].value),
    getLocation: () => _index,
    isComplete: () => _index >= _end,
    canPerform: (action: string) => {
      return (action === NavigationAction.Next && _index < _end) ||
        (action === NavigationAction.Back && _index > 0) ||
        (action === NavigationAction.Home && _index !== 0);
    },
    perform: (action: string) => {
      if (action === NavigationAction.Next) {
        _index++;
      } else if (action === NavigationAction.Back) {
        _index--;
      } else if (action === NavigationAction.Home) {
        _index = 0;
      } else {
        throw new Error(`Invalid action: ${action}`);
      }
    },
  });
}
