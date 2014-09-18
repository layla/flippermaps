var _ = require('underscore')
  , Config = require('./config')
  , DB = require('./db')
  , configLoader = require('./configLoader')
  , ContentTypeCollection = require('trapps-hybrid/src/trapps/collection/contenttypecollection')
  , Collection = require('trapps-hybrid/src/trapps/collection/collection')
  , FieldCollection = require('trapps-hybrid/src/trapps/collection/fieldcollection');

function App(attributes) {
  _.extend(this, attributes);
  this.setupConfig();
  this.setupDatabase();
}

_.extend(App.prototype, {
  setupConfig: function() {
    var data = configLoader.load(this.configFiles);
    this.config = new Config(data);
    this.contentTypes = new ContentTypeCollection(this.config.get('contenttypes'));
    this.fieldTypes = new Collection(this.config.get('fieldtypes'));
    this.defaultFields = new FieldCollection(this.config.get('defaultfields'));
  },

  setupDatabase: function() {
    var config = this.config.get('app').database;
    var locales = _.keys(this.config.get('app').locales);
    this.db = new DB(config, locales, this.contentTypes, this.fieldTypes, this.defaultFields);
  }
});

module.exports = App;
