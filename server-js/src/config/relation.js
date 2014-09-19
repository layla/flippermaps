'use strict';

var _ = require('underscore');
var ConfigObject = require('./configObject');

function Relation(attributes) {
  _.extend(this, attributes);
}

Relation.prototype = Object.create(ConfigObject.prototype);

_.extend(Relation.prototype, {
  constructor: Relation
});

module.exports = Relation;
