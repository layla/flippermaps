window.L = require('leaflet');
window._ = require('underscore');
window.$ = require('jquery');

L.Icon.Default.imagePath = 'images';
var map = L.map('map');

L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
  maxZoom: 18,
  attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
    '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
    'Imagery © <a href="http://mapbox.com">Mapbox</a>',
  id: 'examples.map-i875mjb7'
}).addTo(map);

function onLocationFound(e) {
  var radius = 500;

  L.marker(e.latlng).addTo(map);

  L.circle(e.latlng, radius).addTo(map);
}

function onLocationError(e) {
  alert(e.message);
}

map.on('locationfound', onLocationFound);
map.on('locationerror', onLocationError);

map.locate({setView: true, maxZoom: 12});

$.getJSON('berlin.json', function(flippers) {
  _.each(flippers, function(flipper) {
    var feature = L.geoJson(flipper.pin);
    feature.bindPopup(
      [
        '<h1>'+ flipper.place +'</h1>',
        '<h2>' + flipper.machine + '</h2>',
        flipper.street + ' ' + flipper.number + '<br>',
        'Score: ' + flipper.stars + '/3'
      ].join('')
    );
    feature.addTo(map);
  });
});
