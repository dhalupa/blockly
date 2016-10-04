/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Collapsing field
 *
 */

goog.provide('Blockly.FieldCollapser');

goog.require('Blockly.Field')


/**
 * Class for a checkbox field.
 * @param {string} state The initial state of the field ('TRUE' or 'FALSE').
 * @param {Function=} opt_changeHandler A function that is executed when a new
 *     option is selected.  Its sole argument is the new checkbox state.  If
 *     it returns a value, this becomes the new checkbox state, unless the
 *     value is null, in which case the change is aborted.
 * @extends {Blockly.Field}
 * @constructor
 */
Blockly.FieldCollapser = function (state, opt_validator) {
    Blockly.FieldCollapser.superClass_.constructor.call(this, '', opt_validator);
    this.height_ = 15;
    this.width_ = 15;
    this.size_ = new goog.math.Size(this.width_, this.height_ + 2 * Blockly.BlockSvg.INLINE_PADDING_Y);
    // Set the initial state.
    this.setValue(state);
};
goog.inherits(Blockly.FieldCollapser, Blockly.Field);

/**
 * Rectangular mask used by Firefox.
 * @type {Element}
 * @private
 */
Blockly.FieldCollapser.prototype.rectElement_ = null;

/**
 * Install this collapser on a block.
 */
Blockly.FieldCollapser.prototype.init = function () {
    if (this.fieldGroup_) {
        // Collapser has already been initialized once.
        return;
    }
    // Build the DOM.
    this.fieldGroup_ = Blockly.createSvgElement('g', {}, null);
    if (!this.visible_) {
        this.fieldGroup_.style.display = 'none';
    }
    this.borderRect_ = Blockly.createSvgElement('rect', {
            'rx': 4,
            'ry': 4,
            'x': -Blockly.BlockSvg.SEP_SPACE_X / 2,
            'y': 0,
            'height': 16
        }, this.fieldGroup_, this.sourceBlock_.workspace);
    /** @type {!Element} */
    this.src_ = this.workspace_.options.pathToMedia + (this.state_ ? "expand" : "collapse") + '.png';
    this.imageElement_ = Blockly.createSvgElement('image',
        {
            'height': this.height_ + 'px',
            'width': this.width_ + 'px'
        }, this.fieldGroup_);
    this.imageElement_.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', goog.isString(this.src_) ? this.src_ : '');

    this.updateEditable();
    this.sourceBlock_.getSvgRoot().appendChild(this.fieldGroup_);
    this.mouseUpWrapper_ =
        Blockly.bindEvent_(this.fieldGroup_, 'mouseup', this, this.onMouseUp_);
};

/**
 * Return 'TRUE' if the collapser is collapsed, 'FALSE' otherwise.
 * @return {string} Current state.
 */
Blockly.FieldCollapser.prototype.getValue = function () {
    return String(this.state_).toUpperCase();
};

/**
 * Set the checkbox to be checked if strBool is 'TRUE', unchecks otherwise.
 * @param {boolean} shouldBeCollapsed New state.
 */
Blockly.FieldCollapser.prototype.setValue = function(shouldBeCollapsed) {
    var newState = (shouldBeCollapsed == 'TRUE');
    if (this.state_ !== newState) {
        if (this.sourceBlock_ && Blockly.Events.isEnabled()) {
            Blockly.Events.fire(new Blockly.Events.Change(this.sourceBlock_, 'field', this.name, this.state_, newState));
        }
        this.state_ = newState;
        if (this.imageElement_) {
            this.src_ = this.workspace_.options.pathToMedia + (this.state_ ? "expand" : "collapse") + '.png';
            this.imageElement_.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', goog.isString(this.src_) ? this.src_ : '');
        }
    }
};

/**
 * Toggle the state of the collapser.
 * @private
 */
Blockly.FieldCollapser.prototype.showEditor_ = function() {
    var newState = !this.state_;
    if (this.sourceBlock_) {
        // Call any validation function, and allow it to override.
        newState = this.callValidator(newState);
    }
    if (newState !== null) {
        this.setValue(String(newState).toUpperCase());
    }
};
