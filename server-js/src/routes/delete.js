'use strict';

var app = require('../../bootstrap/start');

module.exports = function (req, res, next) {
  var id = req.params.id
    , contentTypeKey = req.params.contentTypeKey
    , contentType = app.contentTypes.get(contentTypeKey);

  app.storageService.destroy(contentType, id).then(function () {
    res.send(204);
    return next();
  });
};
