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

import Button from '@mui/joy/Button';
import Card from '@mui/joy/Card';
import Divider from '@mui/joy/Divider';
import Sheet from '@mui/joy/Sheet';
import Stack from '@mui/joy/Stack';
import { signal } from '@preact/signals';
import PropTypes from 'prop-types';
import React from 'react';
import { useLoaderData } from 'react-router';
import styles from './sim_panel.module.css';

SimPanel.propTypes = {};

export function SimPanel(props) {
  const pages = useLoaderData();
  const page_num = signal(0);

  return <Page />;
}

Page.propTypes = {
  contents: PropTypes.string.isRequired,
  hasNext: PropTypes.bool.isRequired,
  isHome: PropTypes.bool.isRequired,
  onHome: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
};

export interface PageProps {
  contents: string;
  hasNext: boolean;
  isHome: boolean;
  onHome: () => void;
  onNext: () => void;
}

// TODO: Insert the content
export function Page(props: PageProps) {
  return (
    <Card variant="outlined" className={styles.page} sx={{ width: 640 }}>
      <h1>TODO Insert content here</h1>
      <Divider />
      <Stack direction="row" justifyContent="right" spacing={2}>
        <Button disabled={!props.isHome} variant="soft">
          Home
        </Button>
        <Button disabled={!props.hasNext} variant="soft">
          Next
        </Button>
      </Stack>
    </Card>
  );
}

export default Page;
