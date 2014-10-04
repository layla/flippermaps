'use strict';

var app = require('../../bootstrap/start');

module.exports = function (req, res, next) {
  var contentTypeKey = req.params.contentTypeKey
    , contentType = app.contentTypes.get(contentTypeKey);

  app.storageService.get(contentType).then(function (items) {
    res.send(items);
    return next();
  });
};
