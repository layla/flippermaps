'use strict';

var _ = require('underscore')
  , fs = require('fs')
  , yaml = require('js-yaml');

module.exports = {
  load: function(files) {
    var parsed = {};

    _.each(files, function(file) {
      try {
        var contents = fs.readFileSync('./app/config/' + file + '.yml', 'utf8');
        parsed[file] = yaml.safeLoad(contents);
      } catch (e) {
        console.log(e);
      }
    });

    return parsed;
  }
};
