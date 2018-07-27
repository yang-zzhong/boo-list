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
        }

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
        selected="{{selected}}"
        on-selected="_selected" gap="50">

        <template>
          <div>[[item.index]]</div>
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

  _selected() {
    console.log(this.selected);
  }

  ready() {
    super.ready();
  }

  _changed(changed) {
    if (changed) {
      this.$.list.items = [{
        index: 0,
      }, {
        index: 0,
      }, {
        index: 0,
      }, {
        index: 0,
      }, {
        index: 0,
      }, {
        index: 0,
      }, {
        index: 0,
      }];
      let timer = setInterval(function() {
        for( let i in this.$.list.elems) {
          this.$.list.elems[i].node.style.height = Math.random() * 100 + 'px';
        }
        this.$.list.update();
      }.bind(this), 1000);
      setTimeout(function() {
        clearInterval(timer);
      }, 5000);
      setTimeout(function() {
        this.$.list.update();
      }.bind(this), 100);
    } else {
      this.$.list.items = [{
        index: 1,
      }, {
        index: 1,
      }, {
        index: 1,
      }, {
        index: 1,
      }, {
        index: 1,
      }, {
        index: 1,
      }, {
        index: 1,
      }];
      setTimeout(function() {
        this.$.list.update();
      }.bind(this), 100);
    }
  }
}

window.customElements.define('example-list', ExampleList);
