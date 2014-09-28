var App = require('../src/app');

var app = new App({
  configFiles: [
    'app',
    'contenttypes',
    'defaultfields',
    'defaults',
    'fieldtypes'
  ]
});

app.events.on('create.before', function(contentType, req) {
  console.log('create.before');
});

app.events.on('users::create.before', function(contentType, req) {
  console.log('users::create.before');
});

app.events.on('create.after', function(contentType, req) {
  console.log('create.after');
  app.elasticsearchService.index(contentType, req);
});

app.events.on('users::create.after', function(contentType, req) {
  console.log('users::create.after');
});

module.exports = app;
