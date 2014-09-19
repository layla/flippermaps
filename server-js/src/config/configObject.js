'use strict';

var _ = require('underscore');

function ConfigObject(attributes) {
    _.extend(this, attributes);
}

_.extend(ConfigObject.prototype, {
    set: function(key, value) {
        this[key] = value;
    },

    get: function(key, def) {
        if (typeof this[key] === 'undefined') {
            return def;
        }

        return this[key];
    }
});

module.exports = ConfigObject;
