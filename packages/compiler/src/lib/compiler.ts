import { VFile } from 'vfile';
import { Logger, ILogObj } from 'tslog';
import { splitFile } from './paginator';
import { toHTML, toMarkdown } from './rendering';

export enum FileFormat {
  HTML = 'html',
  Markdown = 'md',
}

/**
 * Compiles and formats a list of VFiles.
 *
 * @param sources Markdown pages to be compiled
 * @param format Output format
 * @returns New VFiles with the compiled content (potentially multiple per source)
 */
export function compile(sources: VFile[], format: FileFormat): VFile[] {
  const log: Logger<ILogObj> = new Logger();
  const outputs: VFile[] = [];
  const formatter = format == FileFormat.HTML ? toHTML : toMarkdown;
  for (const source of sources) {
    log.trace(`Compiling ${source.path}`);
    const pages = splitFile(source);
    outputs.push(...pages.map((page) => formatter(page)));
  }
  return outputs;
}
