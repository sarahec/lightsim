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
import { VFile } from 'vfile';

@customElement('sim-catalog')
export class Catalog extends LitElement {
  @property({ type: Array })
  sources: VFile[] = [];

  static override styles = [
    css`
      :host {
        display: block;
      }
    `,
  ];

  override render() {
    return html`${this.sources.map(
      (source) => html`<catalog-item .source=${source}></catalog-item>`,
    )}`;
  }
}

@customElement('catalog-item')
export class CatalogItem extends LitElement {
  @property({ type: Object })
  source: VFile = new VFile({ path: 'none' });

  static override styles = [
    css`
      :host {
        display: block;
      }
    `,
  ];

  override render() {
    return html`<a href=${this.source.path}>${this.source.basename}</a>`;
  }
}
