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
        computed: '_computeElems(__elems)',
      },
      _colH: Object,
      __instanceId: String,
      __elems: {
        type: Array,
        value: []
      },
    };
  }

  /**
   * The parent node for the _userTemplate.
   */
  get _itemsParent() {
    return this._userTemplate.parentNode;
  }

  constructor() {
    super();
    this.__instanceId = this._instanceId()
    this.__elems[this.__instanceId] = [];
  }

  update() {
    this._update();
  }

  elem(i) {
    if (this.__elems[this.__instanceId][i]) {
      return this.__elems[this.__instanceId][i];
    }
    let item = this.stamp(null);
    let wrapper = document.createElement("div");
    wrapper.style.position = 'absolute';
    wrapper.appendChild(item.root);
    this._itemsParent.appendChild(wrapper);
    this.__elems[this.__instanceId][i] = {
      node: wrapper,
      template: item
    };

    return this.__elems[this.__instanceId][i];
  }

  select(item) {
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
      if (i != -1) {
        this.elems[i].node.classList.add("selected");
      }
      return;
    }
    selected.forEach(item => {
      let i = this.items.indexOf(item);
      this.elems[i].node.classList.add("selected");
    });
  }

  isSelected(item) {
    return this.$.selector.isSelected(item);
  }

  _removeSelected() {
    this.elems.forEach(item => {
      item.node.classList.remove("selected");
    });
  }

  _assignModel(item, model) {
    item._setPendingProperty(this.as, model);
    item._flushProperties && item._flushProperties(true);
  }

  _computeElems(__elems) {
    return __elems[this.__instanceId];
  }

  _update() {
    let items = this.items;
    this._ensureTemplatized();
    for(let i in items) {
      let item = this.elem(i);
      this._assignModel(item.template, items[i]);
    }
    if (items != undefined) {
      while(this.__elems[this.__instanceId][items.length]) {
        let i = items.length;
        let parent = this.__elems[this.__instanceId][i].node.parentNode;
        if (parent) {
          parent.removeChild(this.elems[i].node);
        }
        this.__elems[this.__instanceId].splice(i, 1);
      }
    }
    this.notifyPath("__elems");
    let colWidth = this._colWidth();
    this._colH = {};
    for(let i in this.elems) {
      this.elems[i].node.style.width = colWidth + 'px';
      this.elems[i].node.style.left = this._left(i, colWidth) + 'px';
      this.elems[i].node.style.top = this._top(i) + 'px';
    }
    this.$.items.style.height = this._height() + 'px';
    this._colH = {};
  }

  _height() {
    let height = 0;
    if (!this.elems || this.elems && this.elems.length == 0) {
      return height;
    }
    let items = this.elems.length - 1;
    let len = Math.min(this.cols, items + 1);
    for (let i = 0; i < len; ++i) {
      height = Math.max(this._colH[items - i], height);
    }
    if (height > 0) {
      return height - this.gap;
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

  _top(idx) {
    let height = 0;
    if (idx >= this.cols) {
      height = this._colH[idx - this.cols];
    }
    let rect = this.elems[idx].node.getBoundingClientRect();
    this._colH[idx] = height + rect.height + this.gap;

    return height;
  }

  _colWidth() {
    let rect = this.$.items.getBoundingClientRect();
    return (rect.width - this.gap * (this.cols - 1)) / this.cols;
  }

  _instanceId() {
    return Math.random().toString(36).substr(2);
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
