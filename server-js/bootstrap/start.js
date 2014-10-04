'use strict';

var App = require('../src/app')
  , _ = require('underscore')
  , Promise = require('bluebird')
  , es = require('event-stream')
  , inflection = require('inflection');

var app = new App({
  configFiles: [
    'app',
    'contenttypes',
    'defaultfields',
    'fieldtypes'
  ]
});

// app.events.on('create.before', function createBeforeEventHandler(command) {
  // console.log('create.before:command', command);
// });

app.events.on('create.after', function createAfterEventHandler(evt) {
  this.emit('createafterstarted', 'yeey');
  console.log('ES: Syncing ' + evt.contentType.key + ':' + evt.item.id);

  // retrieve the latest version of the created item from the database, including it's related items
  return app.storageService.find(evt.contentType, evt.item.id).bind(evt)
    .then(function indexItem(item) {
      // send the new item off to elasticsearch
      return app.elasticsearchService.index(this.contentType, item).then(function() {
        // ignore elasticsearch's response, instead we send the item through the pipe
        return item;
      });
    })
    .then(function updateRelatedItemsWithBacklinks(item) {
      var promises = []
        , that = this;

      // check if related models link back to the contentType
      this.contentType.getRelations().each(function(relation) {
        var backLink
          , operation
          , relatedContentType = app.contentTypes.get(relation.key)
          , relatedIdsForRelation = that.links[relation.key];

        // check for changes in this relation
        if (relatedIdsForRelation) {
          backLink = relatedContentType
            .getRelations()
            .get(evt.contentType.key);

          // check if there is a backlink, in case of a backlink we will update the related item(s)
          if (backLink) {
            if (relation.isSingle()) {
              operation = app.storageService.find(relatedContentType, relatedIdsForRelation).then(function(item) {
                return app.elasticsearchService.index(relatedContentType, item);
              });
              // relation is single, so we only need to find it and send it to elasticsearch
              promises.push(operation);
            } else {
              // @TODO implement
            }
          }
        }
      });

      return Promise.all(promises).then(function() {
        // we are not interested in the results of updating the related items, instead we send the item through the pipe
        return item;
      });
    });
});

module.exports = app;

