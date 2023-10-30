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

import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

type FileSet = {
  source: string[];
};

/**
 * A catalog of simulation sources and their compiled versions.
 * @property {string[]} sources - The list of simulation sources, JSON encoded.
 */
@customElement('sim-catalog')
export class Catalog extends LitElement {
  @property({ type: String })
  fileset = '';

  static override styles = [
    css`
      :host {
        display: block;
        border: 1px solid black;
        padding: 1em;
        width: fit-content;
      }
    `,
  ];

  override render() {
    console.debug('Rendering catalog: ', this.fileset);
    const files = JSON.parse(this.fileset) ?? { source: [] };
    return html`${files.source.map(
      (source: string) => html`<catalog-item .source=${source}></catalog-item>`,
    )}`;
  }
}

@customElement('catalog-item')
export class CatalogItem extends LitElement {
  @property({ type: String })
  source = '';

  static override styles = [
    css`
      :host {
        display: block;
      }
    `,
  ];

  override render() {
    const url = new URL(this.source);
    const basename = url.pathname.split('/').pop();
    return html`<a href=${url.pathname}>${basename}</a>`;
  }
}
