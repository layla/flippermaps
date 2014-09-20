var app = require('../../bootstrap/start')
  , _ = require('underscore');

module.exports = function (req, res, next) {
  var include = []
    , where = {}
    , ids = []
    , contentTypeKey = req.params.contentTypeKey
    , contentType = app.contentTypes.get(contentTypeKey)
    , relationKeys = contentType.getRelations().getKeys();

  _.each(relationKeys, function(relationKey) {
    include.push(app.db.models[relationKey]);
  })

  app.db.models[contentTypeKey].findAll({
    include: include,
    where: where
  }).success(function (items) {
    res.send(items);
    return next();
  });
};
