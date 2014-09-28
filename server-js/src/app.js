var _ = require('underscore')
  , elasticsearch = require('elasticsearch')
  , DB = require('./db')
  , configLoader = require('./configLoader')
  , Collection = require('./config/collection/collection')
  , ContentTypeCollection = require('./config/collection/contentTypeCollection')
  , FieldCollection = require('./config/collection/fieldCollection')
  , EventEmitter = require('events').EventEmitter
  , ElasticsearchService = require('../src/elasticsearchService');

function App(attributes) {
  _.extend(this, attributes);
  this.setupConfig();
  this.setupDatabase();
  this.setupEventEmitter();
  this.setupElasticsearch();
  this.setupElasticsearchService();
}

_.extend(App.prototype, {
  setupConfig: function() {
    var config = configLoader.load(this.configFiles);
    var locales = _.keys(config.app.locales);
    this.config = config;
    this.defaultFields = new FieldCollection(this.config.defaultfields);
    this.contentTypes = new ContentTypeCollection(this.config.contenttypes, this.defaultFields, locales);
    this.fieldTypes = new Collection(this.config.fieldtypes);
  },

  setupDatabase: function() {
    var config = this.config.app.database;
    this.db = new DB(config, this.contentTypes, this.fieldTypes);
  },

  setupEventEmitter: function() {
    this.events = new EventEmitter;
  },

  setupElasticsearch: function() {
    this.es = new elasticsearch.Client({
      host: 'localhost:9200',
      log: 'trace'
    });
  },

  setupElasticsearchService: function() {
    this.elasticsearchService = new ElasticsearchService(this.es);
  }
});

module.exports = App;
