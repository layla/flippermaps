'use strict';

var _ = require('underscore')
  , Sequelize = require('sequelize')
  , Promise = require('bluebird')
  , inflection = require('inflection');

function StorageService(models, events) {
  this.models = models;
  this.events = events;
}

function capitaliseFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

_.extend(StorageService.prototype, {
  create: function (contentType, attributes, links) {
    var that = this
      , command = {
        contentType: contentType,
        attributes: attributes,
        links: links || {}
      };

    this.events.emit('create.before', command);

    function updateRelations(item) {
      return that._updateRelations(item, this.contentType, this.links);
    }

    function fireAfterEvents(item) {
      that.events.emit('create.after', {
        item: item,
        contentType: this.contentType,
        attributes: this.attributes,
        links: this.links
      });
      return item;
    }

    return that.models[contentType.key].create(attributes)
      .bind(command)
      .then(updateRelations)
      .then(fireAfterEvents);
  },

  get: function (contentType, where) {
    var options = {}
      , that = this;

    if (where) {
      options.where = where;
    }

    function collectLinks(items) {
      var promises = [];

      _.each(items, function(item) {
        promises.push(that._retrieveLinks(contentType, item));
      });

      return Promise.all(promises);
    }

    return this.models[contentType.key].findAll(options)
      .then(collectLinks);
  },

  getEager: function (contentType, where) {
    var options = {
        include: this._getIncludesForContentType(contentType)
      };

    if (where) {
      options.where = where;
    }

    return this.models[contentType.key].findAll(options)
      .then(this._flattenRelatedToLinks);
  },

  find: function (contentType, id) {
    var that = this;

    return this.models[contentType.key].find({
        where: {
          id: id
        }
      })
      .then(function(item) {
        return that._retrieveLinks(contentType, item);
      });
  },

  findEager: function(contentType, id) {
    return this.models[contentType.key].find({
        where: {
          id: id
        },
        include: this._getIncludesForContentType(contentType)
      })
      .then(this._flattenRelatedToLinks);
  },

  update: function (contentType, id, attributes, links) {
    var that = this
      , command = {
        contentType: contentType,
        id: id,
        attributes: attributes,
        links: links || {}
      };

    this.events.emit('create.before', command);

    function updateItem(item) {
      return item.updateAttributes(this.attributes);
    }

    function updateRelations(item) {
      return that._updateRelations(item, this.contentType, this.links);
    }

    function fireAfterEvents(item) {
      that.events.emit('update.after', {
        item: item,
        id: this.id,
        contentType: this.contentType,
        attributes: this.attributes,
        links: this.links
      });
      return item;
    }

    return that.models[contentType.key].find(id).bind(command)
      .then(updateItem)
      .then(updateRelations)
      .then(fireAfterEvents);
  },

  destroy: function (contentType, id) {
    function destroyItem(item) {
      item.destroy();
    }

    return this.models[contentType.key].find(id)
      .then(destroyItem);
  },

  _getAssociateMethodNameSingular: function (typeKey) {
    var pluralMethodName = this._getAssociateMethodNamePlural(typeKey);
    return pluralMethodName.substring(0, pluralMethodName.length - 1);
  },

  _getAssociateMethodNamePlural: function (typeKey) {
    return 'set' + capitaliseFirstLetter(typeKey);
  },

  _updateRelations: function (item, contentType, links) {
    if ( ! links) {
      return item;
    }

    var associateMethodName
      , relation
      , that = this
      , promises = [];

    _.each(links, function (ids, typeKey) {
      relation = contentType.getRelations().get(typeKey);

      if (!relation) {
        throw new Error('Relation ' + typeKey + ' not found on ' + contentType.key + ' contenttype');
      }

      if (relation.isSingle()) {
        if (!_.isString(ids)) {
          throw new Error('The ' + typeKey + ' relationship expects a id to be given and not an array');
        }
        associateMethodName = that._getAssociateMethodNameSingular(typeKey);
      } else {
        if (!_.isArray(ids)) {
          throw new Error('The ' + typeKey + ' relationship expects a array to be given');
        }
        associateMethodName = that._getAssociateMethodNamePlural(typeKey);
      }

      promises.push(item[associateMethodName](ids));
    });

    return Promise.all(promises).then(function() {
      return item;
    });
  },

   _getIncludesForContentType: function (contentType) {
    var include = []
      , that = this
      , relationKeys = contentType.getRelations().getKeys();

    _.each(relationKeys, function (relationKey) {
      include.push({
        model: that.models[relationKey],
        attributes: ['id']
      });
    });

    return include;
   },

   _flattenRelatedToLinks: function(items) {
    return _.map(items, function(item) {
      var links = [];
      item.dataValues.links = [];

      if (item.options.includeNames) {
        _.each(item.options.includeNames, function(key) {
          var relatedItems = item[key];
          if (_.isArray(relatedItems)) {
            links = _.pluck(relatedItems, 'id');
          } else if (relatedItems) {
            links = relatedItems.id;
          } else {
            links = [];
          }
          item.dataValues.links = item.dataValues.links.concat(links);
          delete item.dataValues[key];
        });
      }

      return item;
    });
  },

  _retrieveLinks: function(contentType, item) {
    var retrieveMethod
      , promises = []
      , relations = contentType.getRelations();

    relations.each(function (relation) {
      if (relation.isSingle()) {
        retrieveMethod = inflection.singularize('get' + capitaliseFirstLetter(relation.key));
      } else {
        retrieveMethod = 'get' + capitaliseFirstLetter(relation.key);
      }

      function pluckIds(items) {
        if (relation.isSingle()) {
          return items.id;
        } else {
          return _.pluck(items, 'id');
        }
      }

      promises.push(item[retrieveMethod]({
          attributes: ['id']
        })
        .then(pluckIds));
    });

    return Promise.all(promises).then(function(allRelatedIds) {
      var links = [];

      _.each(allRelatedIds, function(relatedIds) {
        links = links.concat(relatedIds);
      });

      item.dataValues.links = links;

      return item;
    });
  }
});

module.exports = StorageService;
