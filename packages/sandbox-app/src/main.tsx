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

import compile from '@lightsim/compiler';
import makeRuntime from '@lightsim/runtime';
import CssBaseline from '@mui/joy/CssBaseline';
import { CssVarsProvider } from '@mui/joy/styles';
import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ILogObj, Logger } from 'tslog';
import { VFile } from 'vfile';
import ErrorPage from './app/error-page';
import Root from './app/root';
import { Page, SimController } from './routes/sim';
import Source from './routes/source';


const log = new Logger<ILogObj>({name: 'app', minLevel: 0});

const source = new VFile({value: 
`# This is a test

The lightsim compiler will convert this document into a series of pages.

Note: This came from a static string in the source code. 
It could have come from a file, or from a database, or from a web service.

## This is only a test

This page will be used to try out new content types to see the generated content

### Examples

1. A plain slideshow site
2. A simple branching sim, but with helpful debugging tools
3. A conditional branching site

## This concludes the test

Thank you for reading.
`
});

const compiled = await compile(source);

const runtime = makeRuntime(compiled);


const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: 'sim',
        element: <SimController runtime={runtime} />,
      },
      {
        path: 'source',
        element: <Source />,
      },
    ],
  },
]);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <StrictMode>
    <CssVarsProvider>
      <CssBaseline />
      <RouterProvider router={router} />
    </CssVarsProvider>
  </StrictMode>
);
