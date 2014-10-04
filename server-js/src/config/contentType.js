'use strict';

var _ = require('underscore');
var ConfigObject = require('./configObject');
var FieldCollection = require('./collection/fieldCollection');
var RelationCollection = require('./collection/relationCollection');

function ContentType(attributes, defaultFields, locales) {
  _.extend(this, attributes);
  this.defaultFields = defaultFields;
  this.locales = locales;
}

ContentType.prototype = Object.create(ConfigObject.prototype);

_.extend(ContentType.prototype, {
  constructor: ContentType,

  getFields: function() {
    return this.defaultFields.merge(new FieldCollection(this.fields || {}));
  },

  getDatabaseFields: function() {
    return this.getFields().getAsDatabaseFields(this.locales);
  },

  getRelations: function() {
    return new RelationCollection(this.relations || {});
  }
});

module.exports = ContentType;
