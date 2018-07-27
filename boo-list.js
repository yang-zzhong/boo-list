import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import { Templatizer } from '@polymer/polymer/lib/legacy/templatizer-behavior.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

// const LegacyIronList = customElements.get('iron-list');

/**
 * `boo-waterfall-list`
 * 
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
class BooList extends mixinBehaviors([ Templatizer ], PolymerElement) {

  static get template() {
    return html`
      <style>
        #items {
          position: relative;
        }
      </style>

      <array-selector 
        id="selector" 
        items="{{items}}" 
        selected="{{selected}}"
        multi="{{multi}}"
        toggle="{{toggle}}"></array-selector>

      <div id="items">
        <slot></slot>
      </div>
    `;
  }

  static get properties() {
    return {
      noSelected: {
        type: Boolean,
        reflectToAttribute: true,
        value: false
      },
      selected: {
        observer: '_selectedChanged',
        notify: true
      },
      items: {
        type: Array,
        observer: '_update',
        value: [],
        notify: true
      },
      as: {
        type: String,
        value: "item"
      },
      multi: {
        type: Boolean,
        reflectToAttribute: true
      },
      toggle: {
        type: Boolean,
        reflectToAttribute: true
      },
      gap: {
        type: Number,
        observer: '_update',
        reflectToAttribute: true,
        value: 5,
      },
      cols: {
        type: Number,
        reflectToAttribute: true,
        observer: '_update',
        value: 1
      },
      elems: {
        type: Array,
        reflectToAttribute: true,
        value: []
      },
      _updating: Boolean,
      _updateTimer: Object,
    };
  }

  /**
   * The parent node for the _userTemplate.
   */
  get _itemsParent() {
    return this._userTemplate.parentNode;
  }

  update() {
    this._update();
  }

  elem(i) {
    if (this.elems[i]) {
      return this.elems[i];
    }
    let item = this.stamp(null);
    let wrapper = document.createElement("div");
    wrapper.addEventListener("click", this._select.bind(this));
    wrapper.style.position = 'absolute';
    wrapper.appendChild(item.root);
    this._itemsParent.appendChild(wrapper);
    this.elems[i] = {
      node: wrapper,
      template: item
    };

    return this.elems[i];
  }

  _select(e) {
    if (this.noSelected) {
      return;
    }
    let item = null;
    let wrapper = null;
    for(let i = 0; i < this.elems.length; ++i) {
      if (this._isParentOf(this.elems[i].node, e.target)) {
        item = this.items[i];
        wrapper = this.elems[i].node;
        break;
      }
    }
    this.$.selector.select(item);
    this._selectedChanged(this.selected);
    this.dispatchEvent(new CustomEvent("selected"));
  }

  _selectedChanged(selected) {
    if (!selected) {
      return;
    }
    this._removeSelected();
    if (!this.multi) {
      let i = this.items.indexOf(selected);
      this.elems[i].node.classList.add("selected");
      return;
    }
    selected.forEach(function(item) {
      let i = this.items.indexOf(item);
      this.elems[i].node.classList.add("selected");
    }.bind(this));
  }

  _isParentOf(p, c) {
    let n = c;
    while(n != null) {
      if (p == n) {
        return true;
      }
      n = n.parentNode;
    }

    return false;
  }

  isSelected(item) {
    return this.$.selector.isSelected(item);
  }

  _removeSelected() {
    this.elems.forEach(function(item) {
      item.node.classList.remove("selected");
    }.bind(this));
  }

  _assignModel(item, model) {
    item._setPendingProperty(this.as, model);
    item._flushProperties && item._flushProperties(true);
  }

  _update() {
    let items = this.items;
    this._ensureTemplatized();
    for(let i in items) {
      let item = this.elem(i);
      this._assignModel(item.template, items[i]);
    }
    if (typeof items == 'object') {
      while(this.elems[items.length]) {
        let i = items.length;
        let parent = this.elems[i].node.parentNode;
        if (parent) {
          parent.removeChild(this.elems[i].node);
        }
        this.elems.splice(i, 1);
      }
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
    idx = idx || this.elems.length - 1;
    for(let i = (col - 1); i < idx; i += this.cols) {
      let rect = this.elems[i].node.getBoundingClientRect();
      height += rect.height + this.gap;
    }
    // let height = 0;
    // for (let i in this.elems) {
    //   if (idx != undefined && i >= idx - (this.cols > 1 ? 1 : 0)) {
    //     break;
    //   }
    //   if (this._col(i) != col) {
    //     continue;
    //   }
    //   let rect = this.elems[i].node.getBoundingClientRect();
    //   height += rect.height + this.gap;
    // }
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
