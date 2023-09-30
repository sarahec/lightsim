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

import { ILogObj, Logger } from 'tslog';
import { Node } from 'unist';

/**
 * Parse a directive node into a metadata object.
 * @param node The directive node
 * @param log A logger (optional)
 * @returns a metadata object or undefined if no metadata was found
 */
export default function parseDirective(node: Node, log?: Logger<ILogObj>) {
  const LOGGER_NAME = 'parse directive';
  const _log =
    log?.getSubLogger({ name: LOGGER_NAME }) ??
    new Logger({ name: LOGGER_NAME, minLevel: 3 });

  _log.trace(`Directive: ${JSON.stringify(node)}`);

  if (node.type != 'leafDirective') {
    _log.error(`Node is not a directive: ${JSON.stringify(node)}`);
    return undefined;
  }
  _log.trace(`Parsing directive: ${node.type}`);
  // @ts-expect-error children should exist
  const found = node.children?.filter((child: Node) => child.type === 'text');
  if (!found) {
    _log.error(`Directive has no text: ${JSON.stringify(node)}`);
    return undefined;
  }
  // @ts-expect-error text node has a value
  const text: string = found.map((child: Node) => child.value).join(' ');
  // console.log("Text directive: ", JSON.stringify(node)); // <<<
  // @ts-expect-error text node has a value and a leafDirective has a name
  return { [node.name]: text };
}
