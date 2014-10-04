'use strict';

var _ = require('underscore')
  , Sequelize = require('sequelize')
  , inflection = require('inflection');

function DB(config, contentTypes, fieldTypes) {
  this.config = config;
  this.contentTypes = contentTypes;
  this.fieldTypes = fieldTypes;
  this.models = {};

  this.connection = this.connect();
  this.setupSchema();
  this.sync();
}

_.extend(DB.prototype, {
  connect: function() {
    var config = this.config
      , sequelize = new Sequelize(config.databasename, config.username, config.password, {
        dialect: config.driver,
        port: 5432,
        logging: false
      });

    sequelize
      .authenticate()
      .complete(function(err) {
        if (!!err) {
          console.log('Unable to connect to the database:', err);
        } else {
          console.log('Connection has been established successfully.');
        }
      });

    return sequelize;
  },

  getSequelizeSchemaForContentType: function(contentType) {
    var config
      , fieldTypeConfig
      , schema = {}
      , fieldTypes = this.fieldTypes;

    contentType.getDatabaseFields().each(function(field) {
      fieldTypeConfig = fieldTypes.get(field.type);
      if ( ! fieldTypeConfig) {
        throw new Error("No config found for fieldtype: " + field.type);
      }

      config = _.clone(fieldTypeConfig.sequelize);

      config.type = Sequelize[config.type];
      if (config.defaultValue === "UUIDV4") {
        config.defaultValue = Sequelize.UUIDV4;
      }
      schema[field.key] = config;
    });

    return schema;
  },

  getSetterMethodsForContentType: function(contentType) {
    var methods = {};
    contentType.getDatabaseFields().getJsonFields().each(function(field) {
      methods[field.key] = function(value) {
        this.setDataValue(field.key, JSON.stringify(value));
      };
    });

    return methods;
  },

  getGetterMethodsForContentType: function(contentType) {
    var methods = {};
    contentType.getDatabaseFields().getJsonFields().each(function(field) {
      methods[field.key] = function() {
        if ( ! this.getDataValue(field.key)) {
          return this.getDataValue(field.key);
        }

        return JSON.parse(this.getDataValue(field.key));
      };
    });

    return methods;
  },

  getInstanceMethodsForContentType: function(contentType) {
    return {
      hasRole: function(role) {
        return _.contains(this.roles, 'ROLE_' + role);
      }
    };
  },

  setupSchema: function() {
    var schema
      , relationOptions
      , that = this;

    this.contentTypes.each(function(contentType) {
      schema = that.getSequelizeSchemaForContentType(contentType);
      that.models[contentType.key] = that.connection.define(contentType.key, schema, {
        timestamps: false,
        underscored: true,
        getterMethods: that.getGetterMethodsForContentType(contentType),
        setterMethods: that.getSetterMethodsForContentType(contentType),
        instanceMethods: that.getInstanceMethodsForContentType(contentType)
      });
    });

    this.contentTypes.each(function(contentType) {
      contentType.getRelations().getIncoming().each(function(relation) {
          relationOptions = {};
          if (relation.through) {
            schema = {};
            schema[inflection.singularize(contentType.key) + '_id'] = Sequelize.UUID;
            schema[inflection.singularize(relation.key) + '_id'] = Sequelize.UUID;
            that.models[relation.through] = that.connection.define(relation.through, schema, {
              underscored: true
            });
            relationOptions = {
              through: that.models[relation.through],
              // onDelete: 'CASCADE',
              // hooks: true
            };
          }

          that.models[relation.key][relation.type](that.models[contentType.key], relationOptions);
      });

      contentType.getRelations().getOutgoing().each(function(relation) {
        relationOptions = {};

        if (relation.through) {
          schema = {};
          schema[inflection.singularize(contentType.key) + '_id'] = Sequelize.UUID;
          schema[inflection.singularize(relation.key) + '_id'] = Sequelize.UUID;
          that.models[relation.through] = that.connection.define(relation.through, schema, {
            underscored: true
          });
          relationOptions = {
            through: that.models[relation.through],
            // onDelete: 'CASCADE',
            // hooks: true
          };
        }

        that.models[contentType.key][relation.type](that.models[relation.key], relationOptions);
      });
    });
  },

  sync: function() {
    this.connection
      .sync({
        // force: true
      })
      .complete(function(err) {
         if (!!err) {
           console.log('An error occurred while creating the table:', err);
         } else {
           console.log('It worked!');
         }
      });
  }
});

module.exports = DB;
