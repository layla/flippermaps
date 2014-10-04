'use strict';

var rs
    , fs = require('fs')
    , app = require('../../bootstrap/start')
    , JSONStream = require('JSONStream')
    , file = __dirname + '/../../../world.json'
    , parser = JSONStream.parse([true])
    , usersContentType = app.contentTypes.get('users')
    , machineContentType = app.contentTypes.get('machines')
    , locationContentType = app.contentTypes.get('locations')
    , es = require('event-stream');

module.exports = function(req, res, next) {
  app.storageService.create(usersContentType, {
    email: 'k.schmeets@gmail.com',
    password: 'test'
  }).then(function(user) {
    rs = fs.createReadStream(file);

    rs.pipe(parser)
      .pipe(es.through(function write(data) {
        var that = this;

        this.pause();

        return app.storageService.create(locationContentType, {
          name: data.name,
          pin: data.pin,
          state_name: data.state,
          state_code: data.statecode,
          street: data.street,
          zipcode: data.zipcode,
          housenumber: data.number,
          datecreated: new Date(),
          datechanged: new Date()
        }, {
          users: user.id
        }).then(function(location) {
          return app.storageService.create(machineContentType, {
            name: data.machine,
            rating: Math.ceil((data.stars / 3) * 10),
            datecreated: new Date(),
            datechanged: new Date(),
            votes: 10
          }, {
            users: user.id,
            locations: location.id
          }).then(function() {
            that.resume();
          });
        });
      },
      function end () { //optional
        this.queue(null);
      }))
      .on('end', function() {
        console.log('DONE!');
        res.send('DONE!');
      });
  });
};
