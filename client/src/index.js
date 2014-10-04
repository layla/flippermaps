'use strict';

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
    if (!marker) {
      marker = L.userMarker(location.latlng, {
        smallIcon: true,
        pulsing: true
      }).addTo(map);
    }

    marker.setLatLng(location.latlng);
    marker.setAccuracy(10);
});

map.locate({
    watch: false,
    locate: true,
    setView: true,
    enableHighAccuracy: true
});

var sidebar = L.control.sidebar('sidebar', {
  position: 'left'
}).addTo(map);

var es = new elasticsearch.Client({
  host: 'search.flippermaps.dev',
  // log: 'trace'
});

var markers = new L.MarkerClusterGroup({
  spiderfyOnMaxZoom: true,
  showCoverageOnHover: true,
  zoomToBoundsOnClick: true,
  iconCreateFunction: function (cluster) {
    var childCount = cluster.getChildCount();

    var c = 'marker-cluster-';
    if (childCount < 10) {
      c += 'small';
    } else if (childCount < 100) {
      c += 'medium';
    } else {
      c += 'large';
    }

    return new L.DivIcon({
      html: '<div><span>' + childCount + '</span></div>',
      className: 'marker-cluster ' + c,
      iconSize: new L.Point(34, 34)
    });
  }
});

map.addLayer(markers);

var ballIcon = L.icon({
    iconUrl: 'images/greydot.png',
    // shadowUrl: 'leaf-shadow.png',

    iconSize:     [34, 34], // size of the icon
    // shadowSize:   [50, 64], // size of the shadow
    iconAnchor:   [17, 17], // point of the icon which will correspond to marker's location
    // shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});

es.search({
  index: 'flippermaps',
  type: 'locations',
  body: {
    size: 1000,
    query: {
      match_all: {}
    }
  }
}, function(__, response) {
  _.each(response.hits.hits, function(hit) {
    var location = hit._source;

    var feature = L.marker([location.pin[1], location.pin[0]], {
      icon: ballIcon
    });

    feature.on('click', function(e) {
      es.search({
        index: 'flippermaps',
        type: 'machines',
        body: {
          size: 3,
          query: {
            match_all: {}
          },
          // filtered: {
          //   filter: {
          //     id:
          //   }
          // }
        }
      }, function(__, response) {
        var $locations = $('#locations')
          , dataId = $locations.attr('data-id');

        $locations.attr('data-id', location.id).html([
          '<h1>'+ location.name +'</h1>',
          '<h2>' + location.machine + '</h2>',
          '<p>',
          location.street + ' ' + location.housenumber + '<br>',
          location.zipcode + ' ' + location.state_name + '<br>',
          'Rating: ' + location.rating,
          '</p>'
        ].join(''));

        if (dataId && dataId == location.id) {
          closePanel('locations');
          $locations.removeAttr('data-id');
        } else {
          openPanel('locations');
        }
      });
    });

    markers.addLayer(feature);
  });
});


function openPanel(id) {
  sidebar.open(id);
  var icon = $('.sidebar-tabs a[href="#' + id + '"] i');
  if ( ! icon.hasClass('fa-close')) {
    icon.attr('data-oldclass', icon.attr('class'));
  }
  icon.attr('class', 'fa fa-close');
}

function closePanel(id) {
  sidebar.close();
  var icon = $('.sidebar-tabs a[href="#' + id + '"] i'),
    oldClass = icon.attr('data-oldclass');

  icon.removeAttr('data-oldclass');
  icon.attr('class', oldClass);
}

function togglePanel(id) {
  var icon = $('.sidebar-tabs a[href="#' + id + '"] i')
    , isOpened = icon.attr('data-oldclass');

  if (isOpened) {
    closePanel(id);
  } else {
    openPanel(id);
  }
}

$('.sidebar-tabs li a').click(function(e) {
  e.preventDefault();

  var href = $(this)
    , id = href.attr('href').slice(1);

  togglePanel(id);
});
