'use strict';

var _ = require('underscore');
var Collection = require('./collection');
var Relation = require('../relation');

function RelationCollection(items) {
  this.items = {};
  var that = this;
  _.each(items, function(value, key) {
    value.key = key;
    that.items[key] = new Relation(value);
  });
}
RelationCollection.prototype = Object.create(Collection.prototype);

// Instance methods
_.extend(RelationCollection.prototype, {
  constructor: RelationCollection,

  make: function(items) {
    return new RelationCollection(items);
  },

  getIncoming: function() {
    return this.filterBy('inverted', true, false);
  },

  getOutgoing: function() {
    return this.filterBy('inverted', false, false);
  }
});

module.exports = RelationCollection;
