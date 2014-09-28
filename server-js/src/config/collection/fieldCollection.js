'use strict';

var _ = require('underscore');
var Collection = require('./collection');
var Field = require('../field');

function FieldCollection(items) {
  this.items = {};
  var that = this;
  _.each(items, function(value, key) {
    value.key = key;
    that.items[key] = new Field(value);
  });
}
FieldCollection.prototype = Object.create(Collection.prototype);

// Instance methods
_.extend(FieldCollection.prototype, {
  constructor: FieldCollection,

  make: function(items) {
    return new FieldCollection(items);
  },

  getAsDatabaseFields: function(locales) {
    var itemKey
      , newItem
      , results = {};

    _.each(this.items, function(item, key) {
      if (item.get('multilanguage', false) == true) {
        _.each(locales, function(locale) {
          newItem = _.clone(item);
          itemKey = key + '_' + locale;
          newItem.key = itemKey;
          results[itemKey] = newItem;
        });
      } else {
        results[key] = item;
      }
    });

    return this.make(results);
  },

  getMultilanguageFields: function() {
    if ( ! this.multilanguageFields)  {
      this.multilanguageFields = this.filterBy('multilanguage', true, false);
    }
    return this.multilanguageFields;
  },

  getNonMultilanguageFields: function() {
    if ( ! this.nonMultilanguageFields)  {
      this.nonMultilanguageFields = this.filterBy('multilanguage', false, false);
    }
    return this.nonMultilanguageFields;
  },

  filterByTypeKey: function(typeKey) {
    return this.filterByTypeKeys([typeKey]);
  },

  filterByKeys: function(keys) {
    return this.filter(function(field) {
      return _.contains(keys, field.getKey());
    });
  },

  filterByTypeKeys: function(typeKeys) {
    return this.filter(function(field) {
      return _.contains(typeKeys, field.type);
    });
  },

  filterByGroup: function() {
      var groups = _.uniq(this.listsOption('group'));

      var results = {};
      _.each(groups, function(group) {
        results[group] = this.filterByOption('group', group);
      });

      return this.make(results);
  },

  forPurpose: function(purpose) {
    return this.filterByOption('purpose', purpose)
      .first();
  },

  getTextFields: function() {
    return this.filterByTypeKeys([
      'string',
      'text',
      'textarea',
      'html',
      'markdown'
    ]);
  },

  getJsonFields: function() {
    return this.filterByTypeKeys([
      'point'
    ]);
  }
});

module.exports = FieldCollection;
