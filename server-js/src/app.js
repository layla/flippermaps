var _ = require('underscore')
  , DB = require('./db')
  , configLoader = require('./configLoader')
  , Collection = require('./config/collection/collection')
  , ContentTypeCollection = require('./config/collection/contentTypeCollection')
  , FieldCollection = require('./config/collection/fieldCollection');

function App(attributes) {
  _.extend(this, attributes);
  this.setupConfig();
  this.setupDatabase();
}

_.extend(App.prototype, {
  setupConfig: function() {
    var config = configLoader.load(this.configFiles);
    this.config = config;
    this.contentTypes = new ContentTypeCollection(this.config.contenttypes);
    this.fieldTypes = new Collection(this.config.fieldtypes);
    this.defaultFields = new FieldCollection(this.config.defaultfields);
  },

  setupDatabase: function() {
    var config = this.config.app.database;
    var locales = _.keys(this.config.app.locales);
    this.db = new DB(config, locales, this.contentTypes, this.fieldTypes, this.defaultFields);
  }
});

module.exports = App;
