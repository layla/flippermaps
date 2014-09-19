var scraperjs = require('scraperjs');
var jQuery = require('jquery');
var request = require('request');
var geocoder = require('node-geocoder').getGeocoder('google', 'https', {
  apiKey: 'AIzaSyA-Otx3YVMqnMmeBvMK9wRTnAv55FYE0RQ', // for Mapquest, OpenCage, Google Premier
  formatter: null         // 'gpx', 'string', ...
});
var util = require('util');
var fs = require('fs');

var allResults = [];

for (var i = 0; i < Math.ceil(1248 / 10); i++) {
  scraperjs.StaticScraper.create()
      .request({
        uri: 'http://www.flippern.de/flipper_suchen.php',
        method: 'POST',
        form: {
          pos: i * 10
        },
        encoding: 'binary'
      })
      .scrape(function($) {
          function clean(node) {
            return $(node).text().replace(/[\n ]+/g, '');
          }

          return $('body tbody tr').map(function() {
            var result = {};
            var tds = $(this).find('td');

            result.city = clean(tds[0]);
            result.zipcode = clean(tds[1]);
            result.name = clean(tds[2]);
            result.machine = clean(tds[3]);
            result.address = clean(tds[4]);
            result.stars = $(tds[5]).find('img').length;
            result.note = clean(tds[6]);
            result.lastupdate = clean(tds[7]);

            return result;
          }).get();
      }, function(news) {
        news.forEach(function(item) {
          // console.log(item);
          var address = item.address
              .replace('Str.', 'straße')
              .replace('str.', 'straße')
              .replace(/([0-9]+)/, "+$1")
              .replace(/\(.*\)/g, '');

          if (address == "-") {
            address = item.name;
          }

          var guessString = address +
            ',' +
            item.zipcode +
            ',' +
            item.city;

          console.log(guessString);
          geocoder.geocode(guessString, function(err, res) {
              console.log(res, err);
              if ( ! err) {
                var pl = res[0];

                item.pin = {
                  type: 'Point',
                  coordinates: [pl.longitude, pl.latitude],
                };

                item.city = pl.city;
                item.state = pl.state;
                item.statecode = pl.stateCode;
                item.zipcode = pl.zipcode;
                item.country = pl.country;
                item.street = pl.streetName;
                item.number = pl.streetNumber;
                item.countrycode = pl.countryCode;

                allResults.push(item);
              }
          });
        });
      });
}


setTimeout(function() {
  console.log(util.inspect(allResults, false, null));
  fs.writeFile('scraped.json', JSON.stringify(allResults));
}, 60 * 1000 * 2);
