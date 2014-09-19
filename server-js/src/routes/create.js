var app = require('../../bootstrap/start')
  , _ = require('underscore');

module.exports = function (req, res, next) {
  var contentTypeKey = req.params.contentTypeKey;

  function capitaliseFirstLetter (string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  app.db.models[contentTypeKey].create(req.body).success(function (item) {
    if (req.body.links) {
      _.each(req.body.links, function (ids, typeKey) {
        app.db.models[typeKey].findAll({
          where: {id: ids}
        }).success(function(relatedItems) {
          item['set' + capitaliseFirstLetter(typeKey)](relatedItems);
        });
      });
    }

    res.send(item);
    return next();
  });
};
