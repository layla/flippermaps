'use strict';

var _ = require('underscore');
var ConfigObject = require('../configObject');

/**
 * @class Collection
 */
function Collection(items) {
  this.items = {};
  var that = this;
  _.each(items, function(value, key) {
    value.key = key;
    that.items[key] = new ConfigObject(value);
  });
}

// Instance methods
_.extend(Collection.prototype, {
  /**
   * Create a new instance of the same type with given items
   * @method
   * @param {Object|Array} items The items
   */
  make: function(items) {
    return new Collection(items);
  },

  filter: function(cb) {
    var itemKey,
      item,
      filteredItems = {};

    for (itemKey in this.items) {
      item = this.items[itemKey];

      if (cb(item)) {
        filteredItems[itemKey] = item;
      }
    }

    return this.make(filteredItems);
  },

  /**
   * Filters the collection by a key, value and optionally a defaultvalue.
   * Items only get included in the result when the following expression evaluates true:
   * item.get(key, default) === value
   *
   * @method
   * @param {String} key
   * @param {String} value
   * @param {String} default
   */
  filterBy: function(key, value, def) {
    var itemKey,
      item,
      filteredItems = {};

    for (itemKey in this.items) {
      item = this.items[itemKey];

      if (item.get(key, def) === value) {
        filteredItems[itemKey] = item;
      }
    }

    return this.make(filteredItems);
  },

  /**
   * Filters the collection with filterBy, and returns the first result
   *
   * @method
   * @param {String} key
   * @param {String} value
   * @param {String} default
   */
  findBy: function(key, value, def) {
    return this.filterBy(key, value, def)
      .first();
  },

  /**
   * Returns the first item in the collection
   *
   * @method
   */
  first: function() {
    if (_.isArray(this.items)) {
      return _.first(this.items);
    }

    return _.first(_.values(this.items));
  },

  /**
   * Get an item by it's key (fast!)
   *
   * @method
   * @param key
   */
  get: function(key) {
    return this.items[key];
  },

  /**
   * Get the keys of the items in the collection
   *
   * @method
   * @returns {Array}
   */
  getKeys: function() {
    return _.keys(this.items);
  },

  /**
   * Get items by their key
   *
   * @method
   * @returns Collection
   */
  getMany: function(filterKeys) {
    var that = this
      , filteredItems = {};

    _.each(filterKeys, function(filterKey) {
      if (that.items[filterKey]) {
        filteredItems[filterKey] = that.items[filterKey];
      }
    });

    return this.make(filteredItems);
  },

  /**
   * Merge another collection with this one
   *
   * @method
   * @returns Collection
   */
  merge: function(collection) {
    return this.make(_.extend(this.items, collection.items));
  },

  /**
   * Get a clone of this collection
   *
   * @method
   * @returns Collection
   */
  clone: function() {
    return this.make(this.items);
  },

  /**
   * Turn the collection into an array
   *
   * @method
   * @returns Array
   */
  toArray: function() {
    var item,
      key,
      results = [];

    for (key in this.items) {
      item = this.items[key];
      results.push(item);
    }

    return results;
  }
});

// Mixin methods (stolen from backbone collection)
var methods = ['forEach', 'each', 'map', 'collect', 'reduce', 'foldl',
  'inject', 'reduceRight', 'foldr', 'find', 'detect', 'select',
  'reject', 'every', 'all', 'some', 'any', 'include', 'contains', 'invoke',
  'max', 'min', 'size', 'head', 'take', 'initial', 'rest',
  'tail', 'drop', 'last', 'without', 'difference', 'indexOf', 'shuffle',
  'lastIndexOf', 'isEmpty', 'chain', 'sample'];

_.each(methods, function(method) {
  Collection.prototype[method] = function() {
    var args = [].slice.call(arguments);

    args.unshift(this.toArray());

    return _[method].apply(_, args);
  };
});

module.exports = Collection;
