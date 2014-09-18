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

  if ( ! req.user.hasRole('ADMIN')) {
    // only show apps the current user owns
    if (contentTypeKey == "apps") {
      var apps = req.user.apps;

      _.each(apps, function(app) {
        ids.push(app.id);
      });

      where = {
        id: ids
      };
    } else if (contentTypeKey == "users") {
      where = {
        id: req.user.id
      };
    } else {
      var apps = req.user.apps;

      _.each(apps, function(app) {
        ids.push(app.id);
      });

      where = {
        'apps.id': ids
      };
    }
  }

  app.db.models[contentTypeKey].findAll({
    include: include,
    where: where
  }).success(function (items) {
    res.send(items);
    return next();
  });
};
