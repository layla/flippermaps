'use strict';

var _ = require('underscore');
var Collection = require('./collection');
var ContentType = require('../contentType');

function ContentTypeCollection(items, defaultFields, locales) {
  this.items = {};
  var that = this;
  _.each(items, function(value, key) {
    value.key = key;
    that.items[key] = new ContentType(value, defaultFields.clone(), locales);
  });
  this.defaultFields = defaultFields;
  this.locales = locales;
}
ContentTypeCollection.prototype = Object.create(Collection.prototype);

// Instance methods
_.extend(ContentTypeCollection.prototype, {
  constructor: ContentTypeCollection,

  make: function(items) {
    return new ContentTypeCollection(items, this.defaultFields, this.locales);
  }
});

module.exports = ContentTypeCollection;
