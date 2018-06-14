import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import { Templatizer } from '@polymer/polymer/lib/legacy/templatizer-behavior.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

let Base = mixinBehaviors([
  Templatizer
], PolymerElement);

// const LegacyIronList = customElements.get('iron-list');

/**
 * `boo-waterfall-list`
 * 
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
class BooList extends Base {

  static get template() {
    return html`
      <style>
        #items {
          position: relative;
        }
        ::slotted(*) {
          position: absolute;
        }
      </style>
      <array-selector 
        id="selector" 
        items="{{items}}" 
        selected="{{selectedItems}}" 
        selected-item="{{selectedItem}}"></array-selector>

      <div id="items">
        <slot></slot>
      </div>
    `;
  }

  static get properties() {
    return {
      items: {
        type: Array,
        observer: '_itemChanged',
        notify: true
      },
      as: {
        type: String,
        value: "item"
      },
      gap: {
        type: Number,
        value: 5,
      },
      cols: {
        type: Number,
        observer: '_update',
        value: 1
      },
      elems: {
        type: Array,
        value: []
      }
    };
  }

  /**
   * The parent node for the _userTemplate.
   */
  get _itemsParent() {
    return dom(dom(this._userTemplate).parentNode);
  }

  conncectedCallback() {
    super.connectedCallback();
  }

  _itemChanged() {
    this._update();
  }

  update() {
    this._update(true);
  }

  elem(i) {
    if (this.elems[i]) {
      return this.elems[i];
    }
    let item = this.stamp(null);
    let wrapper = document.createElement("div");
    wrapper.appendChild(item.root);
    this._itemsParent.appendChild(wrapper);
    this.elems[i] = {
      node: wrapper,
      template: item
    };

    return this.elems[i];
  }

  _assignModel(item, model) {
    item._setPendingProperty(this.as, model);
    item._flushProperties && item._flushProperties(true);
  }

  _update(debug) {
    let items = this.items;
    this._ensureTemplatized();
    for(let i in items) {
      let item = this.elem(i);
      this._assignModel(item.template, items[i]);
    }
    for (let i = items.length; i < this.elems.length; i++) {
      this._itemsParent.removeChild(this.elems[i].node);
      this.elems.splice(i, 1);
    }
    let colWidth = this._colWidth();
    for(let i in this.elems) {
      this.elems[i].node.style.width = colWidth + 'px';
      this.elems[i].node.style.left = this._left(i, colWidth) + 'px';
      this.elems[i].node.style.top = this._top(i) + 'px';
    }
    this.$.items.style.height = this._height() + 'px';
  }

  _colHeight(col, idx) {
    let height = 0;
    let gapLen = 0;
    for (let i in this.elems) {
      if (idx && i >= idx - 1) {
        break;
      }
      if (this._col(i) != col) {
        continue;
      }
      let rect = this.elems[i].node.getBoundingClientRect();
      height += rect.height + this.gap;
    }
    return height;
  }

  _height() {
    let height = 0;
    for (let i = 1; i <= this.cols; ++i) {
      let h = this._colHeight(i);
      if (h > height) {
        height = h
      }
    }
    return height;
  }

  _col(index) {
    let col = (parseInt(index) + 1) % this.cols;
    if (col == 0) {
      col = this.cols;
    }
    return col;
  }

  _left(index, width) {
    let col = this._col(index);
    return width * (col - 1) + (col - 1) * this.gap;
  }

  _top(index) {
    let col = this._col(index);
    let res = this._colHeight(col, index);
    return res;
  }

  _colWidth() {
    let rect = this.$.items.getBoundingClientRect();
    return (rect.width - this.gap * (this.cols - 1)) / this.cols;
  }

  /**
   * Templetizes the user template.
   */
  _ensureTemplatized() {
    if (this.ctor) {
      return;
    }
    this._userTemplate = this.queryEffectiveChildren('template');
    if (!this._userTemplate) {
      console.warn('iron-list requires a template to be provided in light-dom');
    }
    var instanceProps = {};
    instanceProps.__key__ = true;
    instanceProps[this.as] = true;
    instanceProps[this.indexAs] = true;
    instanceProps[this.selectedAs] = true;
    instanceProps.tabIndex = true;
    this._instanceProps = instanceProps;
    this.templatize(this._userTemplate, this.mutableData);
  }
}

window.customElements.define('boo-list', BooList);
