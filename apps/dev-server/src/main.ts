/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import express from 'express';
import * as path from 'path';
import * as url from 'url';
import { Logger, ILogObj } from 'tslog';
import { getFilesRecursively } from './lib/files';
import dotenv from 'dotenv';

// Logging
const log = new Logger<ILogObj>({ name: 'dev-server' });

// Configuration
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
log.trace('pwd: ', __dirname);

dotenv.config();

const sourcePath = process.env.SOURCE_PATH || 'examples';
const sourceDir = path.join(__dirname, sourcePath);
log.trace('Source directory: ', sourceDir);

const buildPath = process.env.BUILD_PATH || 'build/';
const buildDir = path.join(__dirname, buildPath);
log.trace('Build directory: ', buildDir);

// Load sources
const files = getFilesRecursively(sourceDir);
log.trace('Sample files loaded: ', files?.length ?? 0);

// Start app
const app = express();

app.use('/', express.static(path.join(__dirname, 'assets')));

app.use('/lib/components', express.static(path.join(__dirname, 'components')));

app.get('/catalog', (req, res) => {
  log.trace('/catalog request: ', req.url);
  res.send(`<sim-catalog sources=${files} />
    ${files.map((file) => `<catalog-item source="${file.path}" />`).join('\n')}
  </Catalog>`);
});

const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/`);
});
server.on('error', console.error);
