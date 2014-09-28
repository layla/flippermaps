var app = require('./bootstrap/start')
  , fs = require('fs')
  , restify = require('restify')
  , passport = require('passport')
  , redirect = require('connect-redirection')
  , sessions = require('client-sessions')
  , LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(function(email, password, done) {
  app.db.models.users.find({ email: email }).success(function (user) {
    if (!user) { return done(null, false); }
    if (user.password !== password) { return done(null, false); }
    return done(null, user);
  }).error(function(err) {
    return done(err);
  });
}));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(userId, done) {
  app.db.models.users.findAll({
    where: {
      id: userId
    }
  }).success(function (users) {
    if (users.length > 0) {
      done(null, users[0]);
    } else {
      done(null, null);
    }
  });
});

var server = restify.createServer({
  name: 'flippermaps',
  version: '1.0.0'
});
server.use(redirect())
server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());
server.use(sessions({
    // cookie name dictates the key name added to the request object
    cookieName: 'session',
    // should be a large unguessable string
    secret: 'ewfijweuih234hr@#Feuifhiuqefvj',
    // how long the session will stay valid in ms
    duration: 365 * 24 * 60 * 60 * 1000
}));
server.use(passport.initialize());
server.use(passport.session());

server.post('/api/login', function (req, res, next) {
    req.body = req.params;
    return next();
  },
  passport.authenticate('local', { failureRedirect: '/api/login' }),
  function(req, res) {
    res.redirect('/');
  });

server.get('/login', function (req, res, next) {
  var body = '<html><body><form method="post" action="/api/login"><input type="text" name="username"><input type="text" name="password"><input type="submit"></form></body></html>';
  res.writeHead(200, {
    'Content-Length': Buffer.byteLength(body),
    'Content-Type': 'text/html'
  });
  res.write(body);
  res.end();
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
}

function logErrors(err, req, res, next) {
  // console.log(err);
  // console.error(err.stack);
  // next(err);
}

function errorHandler(err, req, res, next) {
  // res.status(500);
  // res.render('error', { error: err });
}

server.get('/api/:contentTypeKey', ensureAuthenticated, require('./src/routes/list'), logErrors, errorHandler);
server.post('/api/:contentTypeKey', require('./src/routes/create'), logErrors, errorHandler);
server.get('/api/:contentTypeKey/:id', ensureAuthenticated, require('./src/routes/read'), logErrors, errorHandler);
server.put('/api/:contentTypeKey/:id', ensureAuthenticated, require('./src/routes/update'), logErrors, errorHandler);
server.del('/api/:contentTypeKey/:id', ensureAuthenticated, require('./src/routes/delete'), logErrors, errorHandler);


  app.es.indices.create({
    index: 'flippermaps'
  }, function() {
    app.contentTypes.each(function (contentType) {
      app.elasticsearchService.createMapping(contentType);
    });
  });

server.get('/import', function(req, res, next) {
  var fs = require('fs')
    , JSONStream = require('JSONStream')
    , _ = require('underscore')
    , create = require('./src/routes/create');

  var file = __dirname + '/../world.json';
  var rs = fs.createReadStream(file);

  var parser = JSONStream.parse([true]);

  rs.pipe(parser)
    .on('data', function(flipper) {
      create({
        params: {
          contentTypeKey: 'machines'
        },
        body: {
          name: flipper.machine,
          rating: Math.ceil((flipper.stars / 3) * 10),
          datecreated: new Date,
          datechanged: new Date,
          votes: 10
        }
      }, {
        send: function(machine) {
          create({
            params: {
              contentTypeKey: 'locations'
            },
            body: {
              name: flipper.name,
              pin: flipper.pin,
              state_name: flipper.state,
              state_code: flipper.statecode,
              street: flipper.street,
              zipcode: flipper.zipcode,
              housenumber: flipper.number,
              datecreated: new Date,
              datechanged: new Date,
              links: {
                machines: [machine.get('id')]
              }
            }
          }, {
            send: function(location) {
            }
          }, function() {});
        }
      }, function() {});
    })
    .on('close', function() {
      console.log('DONE!');
      res.send('DONE!');
    });
});

server.get(/.*/, restify.serveStatic({
  'directory': './dist'
}));

server.listen(5000, function () {
  console.log('%s listening at %s', server.name, server.url);
});
