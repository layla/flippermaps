'use strict';

var pg = require ('pg')
  , app = require('./bootstrap/start')
  , _ = require('underscore');

pg.connect('postgres://flippermaps:flippermaps@localhost:5432/flippermapsjs', function(err, client) {
  var timers = {};

  if (err) {
    console.log(err);
  }

  client.on('notification', function(msg) {
    var contentTypeKey
      , contentType
      , payload = msg.payload
      , parts = payload.split(':')
      , type = parts[0]
      , table = parts[1]
      , id = parts[2];

    var timerId = type + table + id;

    // debounce it to speed it up
    if (timers[timerId]) {
      clearTimeout(timers[timerId]);
    }

    timers[type + table + id] = setTimeout(function() {
      console.log(timerId);

      if (type === 'change') {
        if (table.indexOf('_') > -1) {
          // relation table
          app.models[table].find({
            where: {
              id: id
            }
          }).then(function(item) {
            _.each(item, function(value, key) {
              if (key.indexOf('_id') > -1) {
                contentTypeKey = key.replace('_id', '');
                contentType = app.contentTypes.get(contentType);
                app.storageService.find(contentType, value).then(function(item) {
                  app.elasticsearchService.index(contentType, item);
                });
              }
            });
          });
        } else {
          // normal table
          contentType = app.contentTypes.get(table);
          app.storageService.find(contentType, id).then(function(item) {
            app.elasticsearchService.index(contentType, item);
          });
        }
      }

      if (type === 'destroy') {
        // @todo implement
      }
    }, 3000);
  });

  client.query('LISTEN watchers');
});
