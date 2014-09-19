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

module.exports = app;
