var app = require('../../bootstrap/start')
  , _ = require('underscore');

module.exports = function (req, res, next) {
  var contentTypeKey = req.params.contentTypeKey
    , contentType = app.contentTypes.get(contentTypeKey);

  function capitaliseFirstLetter (string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  app.events.emit('create.before', contentType, req);
  app.events.emit(contentTypeKey + '::create.before', contentType, req);

  app.db.models[contentTypeKey].create(req.body).success(function (item) {
    if (req.body.links) {
      _.each(req.body.links, function (ids, typeKey) {
        var relation = contentType.getRelations().get(typeKey);

        if (relation.isSingle()) {
          if ( ! _.isString(ids)) {
            next(new Error('The ' + typeKey + ' relationship expects a id to be given and not an array'));
          }

          app.db.models[typeKey].find(ids)
            .success(function(relatedItem) {
              var methodName = 'set' + capitaliseFirstLetter(typeKey);
              methodName = methodName.substring(0, methodName.length - 1);
              item[methodName](relatedItem);
            });
        } else {
          if ( ! _.isArray(ids)) {
            next(new Error('The ' + typeKey + ' relationship expects a array to be given'));
          }

          var relatedItems = [];
          _.each(ids, function (id) {
            relatedItems.push(app.db.models[typeKey].build({
              id: id
            }));
          });

          // app.db.models[typeKey].findAll({
          //   where: {id: ids}
          // }).success(function(relatedItems) {
            item['set' + capitaliseFirstLetter(typeKey)](relatedItems);
          // });
        }
      });
    }

    app.events.emit('create.after', contentType, item);
    app.events.emit(contentTypeKey + '::create.after', contentType, item);

    res.send(item);
    return next();
  });
};
