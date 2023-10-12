import fs from 'fs';
import path from 'path';
import { VFile } from 'vfile';

export function getFilesRecursively(dirPath: string): VFile[] {
  let paths: VFile[] = [];

  // Read all files and directories under the given path
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  // Iterate over each entry
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    // If the entry is a directory, recursively call this function on it
    if (entry.isDirectory()) {
      paths = paths.concat(getFilesRecursively(fullPath));
    } else {
      // Otherwise, add the file path to the list of files
      paths.push(new VFile({ path: fullPath }));
    }
  }

  return paths;
}
