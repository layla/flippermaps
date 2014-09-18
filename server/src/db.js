var _ = require('underscore')
  , Sequelize = require('sequelize');

function DB(config, locales, contentTypes, fieldTypes, defaultFields) {
  this.config = config;
  this.locales = locales;
  this.contentTypes = contentTypes;
  this.fieldTypes = fieldTypes;
  this.defaultFields = defaultFields;
  this.models = {};

  this.connection = this.connect();
  this.setupSchema();
  // this.sync();
}

_.extend(DB.prototype, {
  connect: function() {
    var config = this.config
      , sequelize = new Sequelize(config.databasename, config.username, config.password, {
        dialect: config.driver,
        port: 5432
      });

    sequelize
      .authenticate()
      .complete(function(err) {
        if (!!err) {
          console.log('Unable to connect to the database:', err)
        } else {
          console.log('Connection has been established successfully.')
        }
      });

    return sequelize;
  },

  getDatabaseFieldsForContentType: function(contentType) {
    var fields = contentType.getFields();

    return this.defaultFields.clone()
      .merge(fields)
      .getAsDatabaseFields(this.locales);
  },

  getSequelizeSchemaForContentType: function(contentType) {
    var config
      , schema = {}
      , fieldTypes = this.fieldTypes;

    this.getDatabaseFieldsForContentType(contentType).each(function(field) {
      config = _.clone(fieldTypes.get(field.type).sequelize);
      config.type = Sequelize[config.type];
      if (config.defaultValue == "UUIDV4") {
        config.defaultValue = Sequelize.UUIDV4;
      }
      schema[field.key] = config;
    });

    return schema;
  },

  setupSchema: function() {
    var schema
      , that = this;

    this.contentTypes.each(function(contentType) {
      schema = that.getSequelizeSchemaForContentType(contentType);

      that.models[contentType.key] = that.connection.define(contentType.key, schema, {
        tableName: contentType.key,
        timestamps: false,
        underscored: true,
        instanceMethods: {
          hasRole: function(role) {
            return _.contains(this.roles, 'ROLE_' + role);
          },
          toJSON: function() {
            var value
              , result = _.clone(this.dataValues);

            if (this.options.includeMap) {
              _.each(this.options.includeMap, function(__, key) {
                value = result[key];

                if ( ! result.links) {
                  result.links = {};
                }

                result.links[key] = value;
                delete result[key];
              });
            }

            return result;
          }
        }
      });
    });

    this.contentTypes.filterBy('system', false, false).each(function(contentType) {
      contentType.getRelations().getIncoming().each(function(relation) {
        that.models[contentType.key].hasMany(that.models[relation.key], {
          through: contentType.key + '_' + relation.key,
          // onDelete: 'CASCADE',
          // hooks: true
        });
      });

      contentType.getRelations().getOutgoing().each(function(relation) {
        that.models[contentType.key].hasMany(that.models[relation.key], {
          through: relation.key + '_' + contentType.key,
          // onDelete: 'CASCADE',
          // hooks: true
        });
      });
    });
  },

  sync: function() {
    this.connection
      .sync({
        force: true
      })
      .complete(function(err) {
         if (!!err) {
           console.log('An error occurred while creating the table:', err)
         } else {
           console.log('It worked!')
         }
      });
  }
});

module.exports = DB;
