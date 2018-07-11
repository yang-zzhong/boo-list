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
        div {
          width: 100%;
          height: 100%;
          max-height: 400px;
          background-color: #f0f0f0;
        }

        boo-list {
          flex: 1 1 auto;
        }
      </style>
      <boo-list id="list" cols="2" items="[[items]]" gap="50">
        <template>
          <div class="item">
            [[item.index]]
          </div>
        </template>
      </boo-list>
    `;
  }

  static get properties() {
    return {
      items: {
        type: Array,
        value: [{
          index: 1
        },{
          index: 2
        },{
          index: 3
        },{
          index: 4
        },{
          index: 5
        },{
          index: 6
        },{
          index: 7
        },{
          index: 8
        },{
          index: 9
        }, {
          index: 10
        }]
      },
    };
  }

  ready() {
    super.ready();
    setTimeout(function() {
      for( let i in this.$.list.elems) {
        this.$.list.elems[i].node.style.height = 10 * (i + 1) + 'px';
      }
      this.$.list.update();
    }.bind(this), 500);
  }
}

window.customElements.define('example-list', ExampleList);
