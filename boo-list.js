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
    let items = this.items;
    this._empty();
    this._ensureTemplatized();
    let colWidth = this._colWidth();
    for(let i in items) {
      let item = this._item(items[i]);
      let rect = item.getBoundingClientRect();
      this.elems[i] = {
        item: item,
        height: rect.height,
        width: colWidth,
        left: this._left(i, colWidth),
        top: this._top(i)
      };
    }
    this._update();
  }

  update() {
    this._itemChanged();
  }

  _empty() {
    let old = this._itemsParent.querySelectorAll(".__item__");
    for(let i in old) {
      if (typeof old[i] == 'object') {
        this._itemsParent.removeChild(old[i]);
      }
    }
  }

  _item(model) {
    let item = this.stamp({item: model});
    let wrapper = document.createElement("div");
    wrapper.setAttribute("class","__item__");
    wrapper.appendChild(item.root);
    this._itemsParent.appendChild(wrapper);
    return wrapper;
  }

  _update() {
    for(let i in this.elems) {
      this.elems[i].item.style.width = this.elems[i].width + 'px';
      this.elems[i].item.style.left = this.elems[i].left + 'px';
      this.elems[i].item.style.top = this.elems[i].top + 'px';
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
      if (this._col(i) == col) {
        height += this.elems[i].height;
        gapLen++;
      }
    }
    return height + (gapLen - 1) * this.gap;
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
    return this._colHeight(col, index);
  }

  _colWidth() {
    let rect = this.$.items.getBoundingClientRect();
    return rect.width / this.cols - this.gap * (this.cols - 1);
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
