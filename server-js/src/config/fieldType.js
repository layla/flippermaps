'use strict';

var _ = require('underscore');
var ConfigObject = require('./configObject');

function FieldType(attributes) {
  _.extend(this, attributes);
}

FieldType.prototype = Object.create(ConfigObject.prototype);

_.extend(FieldType.prototype, {
  constructor: FieldType
});

module.exports = FieldType;
