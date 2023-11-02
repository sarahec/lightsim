/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import compile from '@lightsim/compiler';
import dotenv from 'dotenv';
import express from 'express';
import * as path from 'path';
import { readSync } from 'to-vfile';
import { ILogObj, Logger } from 'tslog';
import * as url from 'url';
import { getFilesRecursively } from './lib/files';


// Logging
const log = new Logger<ILogObj>({ name: 'dev-server' });

// Configuration
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
log.trace('pwd: ', __dirname);

dotenv.config();

const sourcePath = process.env.SOURCE_PATH || 'assets/examples';
const sourceDir = path.join(__dirname, sourcePath);
log.trace('Source directory: ', sourceDir);

const buildPath = process.env.BUILD_PATH || 'build/';
const buildDir = path.join(__dirname, buildPath);
log.trace('Build directory: ', buildDir);

// Load sources
const files: string[] = getFilesRecursively(sourceDir, (path: string) =>
  path.endsWith('.md'),
);
log.trace('Sample files loaded: ', files?.length ?? 0);

// Start app
const app = express();

app.use('/', express.static(path.join(__dirname, 'assets')));

app.get('/catalog', (req, res) => {
  const fileset = { source: files };
  log.trace('Sending /catalog: ', fileset);
  res.send(`<sim-catalog fileset=${JSON.stringify(fileset)} />`);
});

app.get('/compile', (req, res) => {
  const path = req.query.path as string;
  log.trace('Received /compile: ', path);
  const vfile = readSync(path);
  if (vfile.messages.length > 0) {
    log.error('Error reading file: ', vfile.messages);
    res.status(500).send(vfile.messages);
    return;
  }
  const result = compile(vfile);
  // TODO reconfiguring the renderer to supply and write finished files when requested

});

const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/`);
});
server.on('error', console.error);
