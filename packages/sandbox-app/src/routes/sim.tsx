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

import { type RuntimeControls } from '@lightsim/runtime';
import Button from '@mui/joy/Button';
import Card from '@mui/joy/Card';
import Divider from '@mui/joy/Divider';
import Stack from '@mui/joy/Stack';
import { type ReadonlySignal, useSignal } from '@preact/signals-react';
import { log } from 'console';
import { ILogObj, Logger } from 'tslog';

interface SimControllerProps {
  runtime: RuntimeControls;
  log?: Logger<ILogObj>;
}

export function SimController(props: SimControllerProps) {
  const runtime = props.runtime;
  const log = props.log?.getSubLogger({name: 'sim-controller'}) ?? new Logger({name: 'sim-controller'});
  let location = runtime.getLocation();
  const contents = useSignal(props.runtime.getContents(location) ?? "Content missing");
  const controls = [{name: 'Home', action: 'home'}, {name: 'Next', action: 'next'}, ];


  function perform(action: string): void {
    log.debug(`performing action ${action}`);
    if (runtime.canPerform(action)) {
      log.trace(`performing action ${action}`);
      runtime.perform(action);
      location = runtime.getLocation();
      log.trace(`location is now ${location}`);
      contents.value = props.runtime.getContents(location);
      log.silly(`contents is now ${contents.value}`);
    }
  }

  return <Page log={log} contents={contents} controls={controls} perform={perform} canPerform={runtime.canPerform} />;
}

export interface PageProps {
  contents: ReadonlySignal<string>;
  controls: { name: string; action: string }[];
  perform: (action: string) => void;
  canPerform: (action: string) => boolean;
  log?: Logger<ILogObj>;
}

export function Page(props: PageProps) {
  const log = props.log?.getSubLogger({name: 'page'}) ?? new Logger({name: 'page'});
  const body = props.contents.value;

  log.trace(`rendering page with contents ${body}`);
  return (
    <Card variant="outlined" sx={{ width: 640, height: "max-content" }}>
      <div className="contents" dangerouslySetInnerHTML={{ __html: body }} />
      <Divider />
      <Stack direction="row" justifyContent="right" spacing={2}>
        {props.controls.map((control) => (
          <Button key={control.action} disabled={!props.canPerform(control.action)} variant="soft" onClick={() => props.perform(control.action) }>
            {control.name}
        </Button>
        ))}
      </Stack>
    </Card>
  );
}

export default Page;
