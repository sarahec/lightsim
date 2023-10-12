/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import express from 'express';
import * as path from 'path';
import { Logger, ILogObj } from 'tslog';
import { getFilesRecursively } from './lib/files';

const log = new Logger<ILogObj>({ name: 'dev-server' });

log.trace('Loading sample files...');
const files = getFilesRecursively('./assets/examples');

log.trace('Initializing express');
const app = express();

app.use('/', express.static(path.join(__dirname, 'assets')));

app.get('/catalog', (req, res) => {
  res.send(`<div class"catalog">
    <h1>Catalog</h1>
    <ul>
      ${files.map(file => `<li><a href="/${file.path}">${file.basename}</a></li>`).join('\n')}
    </ul>
  </div>`);
});

app.get('/api/time', (_, res) => {
  const date = new Date().toUTCString();
  res.send(`<div id="time">${date}</div>`);
});

const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/`);
});
server.on('error', console.error);

