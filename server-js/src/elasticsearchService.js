var _ = require('underscore');

function ElasticsearchService(es) {
  this.es = es;
}

_.extend(ElasticsearchService.prototype, {
  index: function (contentType, item) {
    var value
      , params
      , data = item.toJSON();

    contentType.getFields().filterByTypeKey('point').each(function (field) {
      value = data[field.key];
      if (value && value.coordinates) {
        data[field.key] = value.coordinates;
      }
    });

    contentType.getFields().filterByTypeKey('datetime').each(function (field) {
      value = data[field.key];
      if (value) {
        data[field.key] = value.getFullYear() + '-' + ('0' + (value.getMonth() + 1)).slice(-2) + '-' + ('0' + value.getDate()).slice(-2) + ' ' + ('0' + (value.getHours() + 1)).slice(-2) + ':' + ('0' + value.getMinutes()).slice(-2) + ':' + ('0' + value.getSeconds()).slice(-2);
      }
    });

    params = {
      index: 'flippermaps',
      type: contentType.key,
      body: data
    };

    this.es.index(params);
  },

  createMapping: function (contentType) {
    var mapping = {}
      , indexName = 'flippermaps';

    mapping[contentType.key] = {
      properties: {}
    };

    contentType.getDatabaseFields().each(function (field) {
      switch (field.type) {
        case 'auto-guid':
          mapping[contentType.key]['properties'][field.key] = {
            type: 'string',
            index: 'not_analyzed'
          };
          break;
        case 'point':
          mapping[contentType.key]['properties'][field.key] = {
            type: 'geo_point'
          };
          break;
        case 'linestring':
        case 'area':
        case 'polygon':
          mapping[contentType.key]['properties'][field.key] = {
            type: 'geo_shape',
            tree: 'quadtree',
            precision: '10m'
          };
          break;
        case 'datetime':
          mapping[contentType.key]['properties'][field.key] = {
            type: 'date',
            format: 'yyyy-MM-dd HH:mm:ss'
          };
          break;
      }
    });

    this.es.indices.putMapping({
      index: indexName,
      type: contentType.key,
      body: mapping
    });
  }
});

module.exports = ElasticsearchService;
