'use strict';

var app = require('../../bootstrap/start');

module.exports = function (req, res, next) {
  var file = req.params.file;

  res.send(require('../../app/config/' + file));
  return next();
};
