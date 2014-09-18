var app = require('../../bootstrap/start')
  , _ = require('underscore');

module.exports = function (req, res, next) {
  var id = req.params.id
    , contentTypeKey = req.params.contentTypeKey;

  app.db.models[contentTypeKey].find(id).success(function (item) {
    item.updateAttributes(req.body).success(function (item) {
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
  });
};
