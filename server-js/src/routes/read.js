var app = require('../../bootstrap/start');

module.exports = function (req, res, next) {
  var id = req.params.id
    , contentTypeKey = req.params.contentTypeKey
    , contentType = app.contentTypes.get(contentTypeKey);

  app.db.models[contentTypeKey].find(id).success(function (item) {
    contentType.getFields().getJsonFields().each(function(field) {
      if (item[field.key]) {
        item[field.key] = JSON.parse(item[field.key]);
      }
    });
    res.send(item);
    return next();
  });
};

