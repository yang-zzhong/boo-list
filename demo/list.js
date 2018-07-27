import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { PolymerElement } from '@polymer/polymer/polymer-element.js';
import '../boo-list.js';

/**
 * `boo-waterfall-list`
 * 
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
class ExampleList extends PolymerElement {

  static get template() {
    return html`
      <style>
        boo-list>div {
          background-color: #f0f0f0;
        }

        boo-list>div.selected {
          background-color: red;
          color: white;
        }
      </style>
      <boo-list 
        id="list" 
        cols="[[cols]]" 
        multi
        toggle
        items="[[items]]"
        selected="{{selected}}"
        gap="50">

        <template>
          <div on-click="_select" style="height: [[item.height]]px">[[item.index]]</div>
        </template>

      </boo-list>
    `;
  }

  static get properties() {
    return {
      selected: Object,
      change: {
        type: Boolean,
        observer: '_changed',
        value: false
      },
      cols: Number,
      items: Array,
    };
  }

  _select(e) {
    let model = this.$.list.modelForElement(e.target);
    this.$.list.select(model.item);
  }

  ready() {
    super.ready();
  }

  _changed(changed) {
    setTimeout(function() {
      let items = [];
      for(let i = 0; i < 100; i++) {
        items.push({
          index: i,
          height: Math.random() * 100
        });
      }
      this.items = items;
    }.bind(this), 1000);
  }
}

window.customElements.define('example-list', ExampleList);
