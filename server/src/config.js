var _ = require('underscore');

function Config(data) {
  this.data = data;
}

_.extend(Config.prototype, {
  get: function(key, def) {
    return this.data[key];
  },

  set: function(key, value) {
    this.data[key] = value;

    return this;
  }
});

module.exports = Config;
