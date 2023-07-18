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

import { freeze } from 'immer';
import { type CompiledSimulation, type Page } from '../interfaces.js';
import makeRuntime from '../runtime.js';

describe('makeRuntime', () => {
  const compiled: Readonly<CompiledSimulation> = freeze({
    pages: [
      {
        metadata: {},
        format: 'html',
        getContents: () => 'Hello, world!',
      },
      {
        metadata: { title: 'Page 2' },
        format: 'html',
        getContents: () => 'This is a test',
      },
    ] as Page[],
  });

  it('should access a list of pages in order', () => {
    const runtime = makeRuntime(compiled);
    expect(runtime.numPages).toBe(2);
    expect(runtime.getLocation()).toBe(0);
    expect(runtime.getContents(0)).toBe('Hello, world!');
    expect(runtime.canPerform('next')).toBe(true);
    expect(runtime.canPerform('back')).toBe(false);
    expect(runtime.canPerform('home')).toBe(false);
    expect(runtime.isComplete()).toBe(false);
    // Move to the next page
    runtime.perform('next');
    expect(runtime.getLocation()).toBe(1);
    expect(runtime.getContents(1)).toBe('This is a test');
    expect(runtime.canPerform('next')).toBe(false);
    expect(runtime.canPerform('back')).toBe(true);
    expect(runtime.canPerform('home')).toBe(true);
    expect(runtime.isComplete()).toBe(true);
    // Go home
    runtime.perform('home');
    expect(runtime.getLocation()).toBe(0);
  });

  it('should not allow invalid actions', () => {
    const runtime = makeRuntime(compiled);
    expect(() => runtime.perform('invalid')).toThrow();
  });

  it('should return a list of navigation options', () => {
    const runtime = makeRuntime(compiled);
    expect(runtime.getNavigation()).toEqual([
      { label: 'home', action: 'home', disabled: true },
      { label: 'back', action: 'back', disabled: true },
      { label: 'next', action: 'next', disabled: false },
    ]);
    runtime.perform('next');
    expect(runtime.getNavigation()).toEqual([
      { label: 'home', action: 'home', disabled: false },
      { label: 'back', action: 'back', disabled: false },
      { label: 'next', action: 'next', disabled: true },
    ]);
  });
});
