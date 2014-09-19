'use strict';

var _ = require('underscore');
var ConfigObject = require('./configObject');

function Field(attributes) {
  _.extend(this, attributes);
}

Field.prototype = Object.create(ConfigObject.prototype);

_.extend(Field.prototype, {
  constructor: Field,

  getInputKey: function(locale) {
    return this.key + (locale ? '_' + locale : '');
  }
});

module.exports = Field;
