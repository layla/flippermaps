'use strict';

var _ = require('underscore')
  , Sequelize = require('sequelize')
  , Promise = require('bluebird');

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

    return that.models[contentType.key].create(attributes)
      .bind(command)
      .then(function updateRelations(item) {
        return that._updateRelations(item, this.contentType, this.links);
      })
      .then(function fireAfterEvents(item) {
        that.events.emit('create.after', {
          item: item,
          contentType: this.contentType,
          attributes: this.attributes,
          links: this.links
        });
        return item;
      });
  },

  get: function (contentType, where) {
    var include = this._getIncludesForContentType(contentType)
      , options = {
        include: include
      };

    if (where) {
      options.where = where;
    }

    return this.models[contentType.key].findAll(options);
  },

  find: function (contentType, id) {
    var include = this._getIncludesForContentType(contentType);

    return this.models[contentType.key].find({
      where: {
        id: id
      },
      include: include
    });
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

    return that.models[contentType.key].find(id).bind(command)
      .then(function updateItem(item) {
        return item.updateAttributes(this.attributes);
      })
      .then(function updateRelations(item) {
        return that._updateRelations(item, this.contentType, this.links);
      })
      .then(function fireAfterEvents(item) {
        that.events.emit('update.after', {
          item: item,
          id: this.id,
          contentType: this.contentType,
          attributes: this.attributes,
          links: this.links
        });
        return item;
      });
  },

  destroy: function (contentType, id) {
    return this.models[contentType.key].find(id)
      .then(function destroyItem(item) {
        item.destroy();
      });
  },

  _getIncludesForContentType: function (contentType) {
    var include = []
      , that = this
      , relationKeys = contentType.getRelations().getKeys();

    _.each(relationKeys, function (relationKey) {
      include.push(that.models[relationKey]);
    });

    return include;
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
  }
});

module.exports = StorageService;
