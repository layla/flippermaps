'use strict';

var _ = require('underscore');
var ConfigObject = require('./configObject');
var FieldCollection = require('./collection/fieldCollection');
var RelationCollection = require('./collection/relationCollection');

function ContentType(attributes) {
  _.extend(this, attributes);
}

ContentType.prototype = Object.create(ConfigObject.prototype);

_.extend(ContentType.prototype, {
  constructor: ContentType,

  getFields: function() {
    return new FieldCollection(this.fields ? this.fields : {});
  },

  getRelations: function() {
    return new RelationCollection(this.relations ? this.relations : {});
  }
});

module.exports = ContentType;
