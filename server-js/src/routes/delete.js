var app = require('../../bootstrap/start');

module.exports = function (req, res, next) {
  var id = req.params.id
    , contentTypeKey = req.params.contentTypeKey;

  app.db.models[contentTypeKey].find(id).success(function (item) {
    item.destroy().success(function () {
      res.send(204);
      return next();
    });
  });
};
