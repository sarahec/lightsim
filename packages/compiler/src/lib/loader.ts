import {toVFile} from "to-vfile";
import glob from "fast-glob";

/**
 * Finds all the files with paths matching the pattern and returns them as VFiles.
 * 
 * Note that these VFiles only contain a path, they have no been read in yet.
 * 
 * @param includePattern 
 * @param excludePattern 
 * @returns 
 */
export async function findContentFiles(includePattern = 'content/**/*.md', excludePattern = "_*.md") {
  return glob(includePattern, {
    onlyFiles: true,
    absolute: true,
    ignore: [excludePattern],
  }).then(files => files.map(file => toVFile(file)));
}

