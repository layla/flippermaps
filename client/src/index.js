window.L = require('leaflet');
window._ = require('underscore');
window.$ = require('jquery');
var elasticsearch = require('elasticsearch');
require('leaflet.markercluster');
require('sidebar-v2/js/leaflet-sidebar');
require('leaflet.usermarker/src/leaflet.usermarker');

L.Icon.Default.imagePath = 'images';
var map = L.map('map');

L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
  maxZoom: 18,
  attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
    '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
    'Imagery © <a href="http://mapbox.com">Mapbox</a>',
  id: 'examples.map-i875mjb7'
}).addTo(map);

var marker;
map.on("locationfound", function(location) {
    if (!marker)
      marker = L.userMarker(location.latlng, {
        smallIcon: true,
        pulsing: true
      }).addTo(map);

    marker.setLatLng(location.latlng);
    marker.setAccuracy(10);
});

map.locate({
    watch: false,
    locate: true,
    setView: true,
    enableHighAccuracy: true
});

var fg = L.featureGroup().addTo(map);

var es = new elasticsearch.Client({
  host: 'search.flippermaps.dev',
  // log: 'trace'
});

var markers = new L.MarkerClusterGroup({
  spiderfyOnMaxZoom: true,
  showCoverageOnHover: true,
  zoomToBoundsOnClick: true
});

map.addLayer(markers);

es.search({
  index: 'flippermaps',
  type: 'locations',
  body: {
    size: 1000,
    query: {
      match_all : {}
    }
  }
}, function(__, response) {
  _.each(response.hits.hits, function(hit) {
    var location = hit._source;

    var feature = L.geoJson({
      type: 'Point',
      coordinates: location.pin
    });
    feature.bindPopup(
      [
        '<h1>'+ location.name +'</h1>',
        '<h2>' + location.machine + '</h2>',
        location.street + ' ' + location.housenumber + '<br>',
        location.zipcode + ' ' + location.state_name + '<br>',
        'Rating: ' + location.rating
      ].join('')
    );

    markers.addLayer(feature);
  });
});

var sidebar = L.control.sidebar('sidebar', {
  position: 'left'
}).addTo(map);
