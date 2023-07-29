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

import { CompiledSimulation, Metadata } from './interfaces.js';

/**
 * Control interface for a session with the simulation.
 * @property getContents - the contents of the currrent page.
 * @property isComplete - whether the session is complete.
 * @property canPerform - whether the given action can be performed.
 * @property perform - perform the given action.
 * @property isHome - whether the session is at the home page.
 */
export type RuntimeControls = {
  readonly numPages: number;
  getContents(location: number): string;
  getLocation(): number;
  getMetadata(location?: number): Metadata;
  getNavigation(location?: number): NavigationOption[];
  isComplete(): boolean;
  canPerform(action: string): boolean;
  perform(action: string): void;
};

export type NavigationAction = 'next' | 'back' | 'home';

/**
 * Interface to per-page navigation
 * @property label - the label for the navigation option (e.g. link or button)
 * @property action - the action to perform when the option is selected.
 * @property disabled - whether the option is disabled.
 */
export type NavigationOption = {
  readonly label: string;
  readonly action: NavigationAction | string;
  readonly disabled: boolean;
};

/**
 * Create the control interface for a simulation.
 * @param sim - a compiled simulation. (See @lightsim/compiler::compile).
 * @returns the control interface.
 */

export function makeRuntime(
  sim: CompiledSimulation,
): Readonly<RuntimeControls> {
  const _pages = sim.pages;
  let _index = 0;
  const _end = sim.pages.length - 1;

  return {
    numPages: _pages.length,
    getContents: (location: number) => String(_pages[location].getContents()),
    getLocation: () => _index,
    getMetadata: (location?: number) => {
      const loc = location ?? _index;
      return _pages[loc].metadata ?? {};
    },
    getNavigation: (location?: number) => {
      const loc = location ?? _index;
      return [
        { label: 'home', action: 'home', disabled: loc === 0 },
        { label: 'back', action: 'back', disabled: loc <= 0 },
        { label: 'next', action: 'next', disabled: loc >= _end },
      ];
    },
    isComplete: () => _index >= _end,
    canPerform: (action: string) => {
      return (
        (action === 'next' && _index < _end) ||
        (action === 'back' && _index > 0) ||
        (action === 'home' && _index !== 0)
      );
    },
    perform: (action: string) => {
      if (action === 'next') {
        _index++;
      } else if (action === 'back') {
        _index--;
      } else if (action === 'home') {
        _index = 0;
      } else {
        throw new Error(`Invalid action: ${action}`);
      }
    },
  };
}
