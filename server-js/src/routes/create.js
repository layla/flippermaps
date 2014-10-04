'use strict';

var app = require('../../bootstrap/start');

module.exports = function (req, res, next) {
  var contentTypeKey = req.params.contentTypeKey
    , contentType = app.contentTypes.get(contentTypeKey);

  app.storageService.create(contentType, req.body, req.body.links || null).then(function(item) {
    res.send(item);
    return next();
  });
};
