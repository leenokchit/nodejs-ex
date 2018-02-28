//  OpenShift sample Node application
var express = require('express'),
    app     = express(),
    morgan  = require('morgan'),
    exphbs  = require('express-handlebars'),
    passport = require('passport'),
    LocalStrategy = require('passport-local'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    session = require('express-session'),
    multer  = require('multer'),
    fileUpload = require("express-fileupload");
    //var jwt = require('jsonwebtoken');

var upload = multer({ dest: 'uploads/' });
var funct = require('./functions.js');
var Config = require('./serverjs/config.js');

Object.assign=require('object-assign')

//===============PASSPORT=================

// Passport session setup.
passport.serializeUser(function(user, done) {
  console.log("serializing " + user.username);
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  console.log("deserializing " + obj);
  done(null, obj);
});

// Use the LocalStrategy within Passport to login users.
passport.use('local-signin', new LocalStrategy(
  {passReqToCallback : true}, //allows us to pass back the request to the callback
  function(req, username, password, done) {
    funct.localAuth(username, password)
    .then(function (user) {
      if (user) {
        console.log("LOGGED IN AS: " + user.username);
        req.session.success = 'You are successfully logged in ' + user.username + '!';
        done(null, user);
      }
      if (!user) {
        console.log("COULD NOT LOG IN");
        req.session.error = 'Could not log user in. Please try again.'; //inform user could not log them in
        done(null, user);
      }
    })
    .fail(function (err){
      console.log(err.body);
    });
  }
));

// Use the LocalStrategy within Passport to Register/"signup" users.
passport.use('local-signup', new LocalStrategy(
  {passReqToCallback : true}, //allows us to pass back the request to the callback
  function(req, username, password, done) {
    funct.localReg(username, password)
    .then(function (user) {
      if (user) {
        console.log("REGISTERED: " + user.username);
        req.session.success = 'You are successfully registered and logged in ' + user.username + '!';
        done(null, user);
      }
      if (!user) {
        console.log("COULD NOT REGISTER");
        req.session.error = 'That username is already in use, please try a different one.'; //inform user could not log them in
        done(null, user);
      }
    })
    .fail(function (err){
      console.log(err.body);
    });
  }
));

// Simple route middleware to ensure user is authenticated.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  req.session.error = 'Please sign in!';
  res.redirect('/signin'); 
}
//===============PASSPORT END==============



app.engine('html', require('ejs').renderFile);
app.use(morgan('combined'))


////
// Configure Express
//app.use(express.logger());
app.use(cookieParser());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(session({ secret: 'supernova' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(fileUpload());

app.use(function(req, res, next){
  var err = req.session.error,
      msg = req.session.notice,
      success = req.session.success;

  delete req.session.error;
  delete req.session.success;
  delete req.session.notice;

  if (err) res.locals.error = err;
  if (msg) res.locals.notice = msg;
  if (success) res.locals.success = success;

  next();
});


//// 
app.use('/js', express.static(__dirname + '/js/bootstrap')); // redirect bootstrap JS
app.use('/js', express.static(__dirname + '/js/jquery')); // redirect JS jQuery
app.use('/js', express.static(__dirname + '/js')); // redirect JS
app.use('/css', express.static(__dirname + '/css/bootstrap')); // redirect CSS bootstrap
app.use('/css', express.static(__dirname + '/css')); // redirect CSS
app.use('/public', express.static(__dirname + '/public')); // redirect CSS bootstrap
app.use('/serverjs', express.static(__dirname + '/serverjs')); // redirect CSS bootstrap
////

// Configure express to use handlebars templates
var hbs = exphbs.create({
    defaultLayout: 'main',
});
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
////



var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
    mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL,
    mongoURLLabel = "";

if (mongoURL == null && process.env.DATABASE_SERVICE_NAME) {
  var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase(),
      mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'],
      mongoPort = process.env[mongoServiceName + '_SERVICE_PORT'],
      mongoDatabase = process.env[mongoServiceName + '_DATABASE'],
      mongoPassword = process.env[mongoServiceName + '_PASSWORD']
      mongoUser = process.env[mongoServiceName + '_USER'];
      //mongoUser = "admin";

  if (mongoHost && mongoPort && mongoDatabase) {
    mongoURLLabel = mongoURL = 'mongodb://';
    if (mongoUser && mongoPassword) {
      mongoURL += mongoUser + ':' + mongoPassword + '@';
    }
    // Provide UI label that excludes user id and pw
    mongoURLLabel += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
    mongoURL += mongoHost + ':' +  mongoPort + '/' + mongoDatabase;

  }
}

//for dev
if(process.env.APPMODE == "DEV")
{
  mongoURL = 'mongodb://admin:padmin@127.0.0.1:27117/istory';
}

//

var db = null,
    dbDetails = new Object();

var initDb = function(callback) {
  if (mongoURL == null) return;

  var mongodb = require('mongodb');
  if (mongodb == null) return;

  mongodb.connect(mongoURL, function(err, conn) {
    if (err) {
      callback(err);
      return;
    }

    db = conn;
    dbDetails.databaseName = db.databaseName;
    dbDetails.url = mongoURLLabel;
    dbDetails.type = 'MongoDB';

    console.log('Connected to MongoDB at: %s', mongoURL);
  });
};

app.get('/', function (req, res) {
  console.log("index: " + req.ip + " connected at " + Date.now());
  // try to initialize the db on every request if it's not already
  // initialized.
  if (!db) {
    initDb(function(err){});
  }
  if (db) {
    var col = db.collection('counts');
    // Create a document with request IP and current time of request
    col.insert({ip: req.ip, date: Date.now()});
    col.count(function(err, count){
      if (err) {
        console.log('Error running count. Message:\n'+err);
      }
      res.render('index.html', { pageCountMessage : count, dbInfo: dbDetails });
    });
  } else {
    res.render('index.html', { pageCountMessage : null});
  }
});

app.get('/pagecount', function (req, res) {
  console.log("pagecount: " + req.ip + " connected at " + Date.now());
  
  // try to initialize the db on every request if it's not already
  // initialized.
  if (!db) {
    initDb(function(err){});
  }
  if (db) {
    db.collection('counts').count(function(err, count ){
      res.send('{ pageCount: ' + count + '}');
      console.log( 'pageCount: ' + count );
    });
  } else {
    res.send('{ pageCount: -1 }');
  }
});

app.get('/flickr', function (req, res) {
  console.log("flickr: " + req.ip + " connected at " + Date.now());
  var Flickr = require("flickr-sdk");
  var FlickrOptions = {
    api_key: "b8a2e422605e075c1d67fcb3c216ee77",
    secret: "7c0da767e90a9bda"
  };
  var oauth = new Flickr.OAuth(
    "b8a2e422605e075c1d67fcb3c216ee77",
    "7c0da767e90a9bda"
  );

  oauth.request('http://localhost:3000/oauth/callback').then(function (res) {
    console.log('yay!', res);
  }).catch(function (err) {
    console.error('bonk', err);
  });
  res.send('{ flickr: success }');
});

app.get('/gc', function (req, res) {
  console.log("gc: " + req.ip + " connected at " + Date.now());

  var gcCredentials = {};
  var mongodb = require('mongodb');
  if (mongodb == null) return;
  mongodb.connect(mongoURL, function(err, db) {
    if (err) throw err;
    var dbo = db.db("istory");
    dbo.collection("googleCloudStorage").findOne({}, function(err, result) {
      if (err) throw err;
      console.log(result);
      db.close();
      gcCredentials = result;

      var Promise = require('bluebird');
      var GoogleCloudStorage = Promise.promisifyAll(require('@google-cloud/storage'));

      var storage = GoogleCloudStorage({
        projectId: 'iStory-25dc782964c4',
        //keyFilename: './public/iStory-25dc782964c4.json'
        credentials:  {
                        "type": gcCredentials.type,
                        "project_id": gcCredentials.project_id,
                        "private_key_id": gcCredentials.private_key_id,
                        "private_key": gcCredentials.private_key,
                        "client_email": gcCredentials.client_email,
                        "client_id": gcCredentials.client_id,
                        "auth_uri": gcCredentials.auth_uri,
                        "token_uri": gcCredentials.token_uri,
                        "auth_provider_x509_cert_url": gcCredentials.auth_provider_x509_cert_url,
                        "client_x509_cert_url": gcCredentials.client_x509_cert_url
                      }
      })

      var BUCKET_NAME = 'istory-bucket';

      var myBucket = storage.bucket(BUCKET_NAME)

      // check if a file exists in bucket
      var file = myBucket.file('myImage.jpg')
      file.existsAsync()
        .then(exists => {
          if (exists) {
            // file exists in bucket
          }
        })
        .catch(err => {
           return err
        })

        const fs = require('fs');
        const gm = require('gm').subClass({imageMagick: true});

        var writeStream = fs.createWriteStream('./public/test2.jpg');
          gm('./public/test.jpg')
          .resize('100', '100')
          .stream()
          .pipe(writeStream);

      // upload file to bucket
      let localFileLocation = './public/test.jpg'
      myBucket.uploadAsync(localFileLocation, { public: true })
        .then(file => {
          // file saved
          //res.send(file);
        })

      // get public url for file
      var getPublicThumbnailUrlForItem = file_name => {
        return `https://storage.googleapis.com/${BUCKET_NAME}/${file_name}`
      }

      //list files
      storage
      .bucket(BUCKET_NAME)
      .getFiles()
      .then(results => {
        const files = results[0];
      
        res.send(files);

        console.log('Files:');
        files.forEach(file => {
          console.log(file.name);
        });
      })
      .catch(err => {
        console.error('ERROR:', err);
      });

    });
  });

  
});

app.post('/createBucket', function (req, res, next) {
  var bucket_name = req.body.bucketName;
  if(bucket_name == undefined)
  {
    res.json({
      isValid: false,
      errMessage: 'Invalid input'
    });
    return;
  } 
  else
  {
    bucket_name = 'istory-' + bucket_name.trim();
  }


  console.log("createBucket: " + req.ip + " connected at " + Date.now());

  var config = new Config();
  var gcCredentials = {};
  config.getGcCredentials()
  .then(function(result)
  {
    if(result != false)
    {
      gcCredentials = result;

      var Promise = require('bluebird');
      var GoogleCloudStorage = Promise.promisifyAll(require('@google-cloud/storage'));

      var storage = GoogleCloudStorage({
        projectId: gcCredentials.project_id,
        credentials: gcCredentials
      })

      var gcBucket = require('./serverjs/buckets.js');
      var bucket = new gcBucket();
      bucket.createBucket(bucket_name, storage).then(function(result){
        console.log(result);
        res.send(result);
      })
      .catch(function(err){
        console.log(err);
        res.send(err);
      });

      var bucket = new gcBucket();
      bucket.createBucket('thumbnail-' + bucket_name, storage).then(function(result){
        console.log(result);
        //res.send(result);
      })
      .catch(function(err){
        console.log(err);
      });
    }

    else
    {
      res.json({
        success: false,
        errMessage: `Get google cloud credentials fail!`
      });
    }
  });
});

app.post('/upload', function (req, res, next) {
  console.log("upload: " + req.ip + " connected at " + Date.now());

  var bucket_name = req.body.bucket || '';
  if(bucket_name.trim() == "")
  {
    res.json({isValid:false, errMessage: 'Missing bucket for file to upload'});
  }
  else
  {
    bucket_name = 'istory-' + bucket_name;
  }

  var config = new Config();
  var gcCredentials = {};
  config.getGcCredentials()
  .then(function(result)
  {
    if(result != false)
    {
      gcCredentials = result;

      var Promise = require('bluebird');
      var GoogleCloudStorage = Promise.promisifyAll(require('@google-cloud/storage'));

      var storage = GoogleCloudStorage({
        projectId: gcCredentials.project_id,
        credentials: gcCredentials
      })

      var BUCKET_NAME = bucket_name;
      var THUMBNAIL_BUCKET_NAME = 'thumbnail-' + BUCKET_NAME;
      var myBucket = storage.bucket(BUCKET_NAME)
      var myBucket_thumbnail = storage.bucket(THUMBNAIL_BUCKET_NAME)

      
      //const restify = require("restify");
      const uuidv4 = require("uuid/v4");
      const fs = require("fs");

      var filescount = 0;
      if(req.files.file.length > 1)
        filescount = req.files.file.length;
      else if(req.files.file.length > 1)
      {
        filescount = 0;
        res.json({
          isValid: false,
          errMessage: 'No file is selected'
        });
        return;
      }
      else  
        filescount = 1;
      for(var i = 0; i < filescount; i++)
      {
        var file = filescount == 1 ? req.files.file : req.files.file[i];
        //const {file} = req.files.file[i];
        const gcsname = uuidv4() + '.' + file.name.split(/[. ]+/).pop();
        const gcsname_thumbnail = 'thumbnail-' + gcsname;
        //const gcsname = file.name;
        const files = myBucket.file(gcsname);
        const files_thumbnail = myBucket_thumbnail.file(gcsname_thumbnail);

        var streamifier = require('streamifier');

        //fs.createReadStream(file.data)
      
        streamifier.createReadStream(file.data)
        .pipe(files.createWriteStream({
          metadata: {
            contentType: file.type
          }
        }))
        .on("error", (err) => {
          console.log(err);
          //restify.InternalServerError(err);
        })
        .on('finish', () => {

          var file = myBucket.file(gcsname);
          // Make a file publicly readable.
          var options = {
            entity: 'allUsers',
            role: storage.acl.READER_ROLE
          };
          file.acl.add(options).then(function(data) {
            var aclObject = data[0];
            var apiResponse = data[1];
          });

          //File Path:
          //`https://storage.googleapis.com/${BUCKET_NAME}/${gcsname}`
          
        });


        const gm = require('gm').subClass({imageMagick: true});

        gm(streamifier.createReadStream(file.data))
        .resize('200', '200')
        .stream()
        .pipe(files_thumbnail.createWriteStream({
          metadata: {
            contentType: file.type
          }
        }))
        .on("error", (err) => {
          console.log(err);
          //restify.InternalServerError(err);
        })
        .on('finish', () => {
  
          var files_thumbnail = myBucket_thumbnail.file(gcsname_thumbnail);
          // Make a file publicly readable.
          var options = {
            entity: 'allUsers',
            role: storage.acl.READER_ROLE
          };
          files_thumbnail.acl.add(options).then(function(data) {
            var aclObject = data[0];
            var apiResponse = data[1];
          });
        });
      }
      res.json({
        isValid: true
      });
    }

    else
    {
      res.json({
        success: false,
        errMessage: `Get google cloud credentials fail!`
      })
    }
  });
});

app.get('/createBucket2', function (req, res) {
  console.log("createBucket: " + req.ip + " connected at " + Date.now());

  var config = new Config();
  var gcCredentials = {};
  config.getGcCredentials()
  .then(function(result)
  {
    if(result != false)
    {
      gcCredentials = result;

      var Promise = require('bluebird');
      var GoogleCloudStorage = Promise.promisifyAll(require('@google-cloud/storage'));

      var storage = GoogleCloudStorage({
        projectId: gcCredentials.project_id,
        credentials: {
                        "type": gcCredentials.type,
                        "project_id": gcCredentials.project_id,
                        "private_key_id": gcCredentials.private_key_id,
                        "private_key": gcCredentials.private_key,
                        "client_email": gcCredentials.client_email,
                        "client_id": gcCredentials.client_id,
                        "auth_uri": gcCredentials.auth_uri,
                        "token_uri": gcCredentials.token_uri,
                        "auth_provider_x509_cert_url": gcCredentials.auth_provider_x509_cert_url,
                        "client_x509_cert_url": gcCredentials.client_x509_cert_url
                      }
      })

      var gcBucket = require('./serverjs/buckets.js');
      console.log(gcBucket);
      var bucket = new gcBucket('abc');
      bucket.createBucket('abc',storage);
    }
  });
});

app.get('/listBuckets', function (req, res) {
  console.log("listBuckets: " + req.ip + " connected at " + Date.now());

  var config = new Config();
  var gcCredentials = {};
  config.getGcCredentials()
  .then(function(result)
  {
    if(result != false)
    {
      gcCredentials = result;

      var Promise = require('bluebird');
      var GoogleCloudStorage = Promise.promisifyAll(require('@google-cloud/storage'));

      var storage = GoogleCloudStorage({
        projectId: gcCredentials.project_id,
        credentials: gcCredentials
      })

      var gcBucket = require('./serverjs/buckets.js');
      console.log(gcBucket);
      var bucket = new gcBucket('abc');
      bucket.listBuckets(storage).then(function(result){
        console.log(result);
        res.send(result);
      });
    }
  });
});

app.get('/listFiles', function (req, res) {
  console.log("listFiles: " + req.ip + " connected at " + Date.now());

  var bucket_name = req.query.bucket || '';
  if(bucket_name.trim() == '')
  {
    res.send({isValid: false, errMessage: 'Missing bucket name for listing file!'});
  }
  else
  {
    bucket_name = 'istory-' + bucket_name;
  }

  var config = new Config();
  var gcCredentials = {};
  config.getGcCredentials()
  .then(function(result)
  {
    if(result != false)
    {
      gcCredentials = result;

      var Promise = require('bluebird');
      var GoogleCloudStorage = Promise.promisifyAll(require('@google-cloud/storage'));

      var storage = GoogleCloudStorage({
        projectId: gcCredentials.project_id,
        credentials: gcCredentials
      })

      var gcFile = require('./serverjs/file.js');
      console.log(gcFile);
      var file = new gcFile();
      file.listFiles(bucket_name, storage).then(function(result){
        console.log(result);
        res.send(result);
      });
    }
  });
});

app.get('/getCr', ensureAuthenticated, function (req, res) {

  var Promise = require('bluebird');
  var Config = require('./serverjs/config.js');


  var c = new Config();
  c.getGcCredentials()
  .then(function(result) {
    if(result != false)
    {
      console.log(result);
      res.send(result);
    }
  }).catch(function(e){
    console.log(e);
  })
});

app.get('/getCalendar', function (req, res) {
  console.log("getCalendar: " + req.ip + " connected at " + Date.now());

  var Promise = require('bluebird');
  var Config = require('./serverjs/config.js');
  var Calendar = require('./serverjs/calendar.js');

  var c = new Config();
  var mongourl = c.getMongoURL();

  console.log('getCalendar result: ' + mongourl);

  var startDate = req.query.startDate || 0;
  startDate = parseInt(startDate);
  var endDate = req.query.endDate || 99999999;
  endDate = parseInt(endDate);
  //var queryString = "?startDate=" + startDate + "&endDate=" + endDate;

  var calendar = new Calendar(mongourl);

  calendar.getCalendar(startDate,endDate)
  .then(function(result) {
    if(result != false)
    {
      console.log(result);
      res.json(result);
    }
    else if(result.length == 0)
    {
      res.json({});
    }
  }).catch(function(e){
    console.log(e);
  })
});

app.post('/insertCalendar', function (req, res) {
  console.log("insertCalendar: " + req.ip + " connected at " + Date.now());
  var dayEvent = req.body.dayEvent;

  var Promise = require('bluebird');
  var Config = require('./serverjs/config.js');
  var Calendar = require('./serverjs/calendar.js');

  var c = new Config();
  var mongourl = c.getMongoURL();

  var startDate = req.body.startDate || 0;
  var endDate = req.body.endDate || 99999999;
  //var queryString = "?startDate=" + startDate + "&endDate=" + endDate;

  var calendar = new Calendar(mongourl);

  calendar.insertCalendar(dayEvent.title, dayEvent.eventDate, dayEvent.startTime, dayEvent.endTime, dayEvent.content)
  .then(function(result) {
    if(result != false)
    {
      console.log(result);
      res.json({isValid: result, message: `event '${dayEvent.content}' is added on ${dayEvent.eventDate} from ${dayEvent.startTime} to ${dayEvent.endTime}`});
    }
  }).catch(function(e){
    console.log(e);
  })
});
app.post('/calendar/removeCalendarEvent', function (req, res) {
  console.log("calendar => removeCalendarEvent: " + req.ip + " connected at " + Date.now());

  var Promise = require('bluebird');
  var Config = require('./serverjs/config.js');
  var Calendar = require('./serverjs/calendar.js');

  var c = new Config();
  var mongourl = c.getMongoURL();

  var id = req.body.id || null;
  if(id == null)
  {
    res.json({isValid: false, errMessage: 'missing input: id'});
    return;
  }
  var calendar = new Calendar(mongourl);

  calendar.removeCalendarEvent(id)
  .then(function(result) {
    if(result != false)
    {
      console.log(result);
      res.json({isValid: true, message: `event is removed`});
    }
  }).catch(function(e){
    console.log(e);
  })
});

////router
//displays our homepage
app.get('/home', function(req, res){
  console.log("home: " + req.ip + " connected at " + Date.now());
  res.render('home', {user: req.user});
});

//displays our istory page
app.get('/istory', function(req, res){
  console.log("istory: " + req.ip + " connected at " + Date.now());
  res.render('istory');
});

//displays our signup page
app.get('/signin', function(req, res){
  console.log("signin: " + req.ip + " connected at " + Date.now());
  res.render('signin');
});

//sends the request through our local signup strategy, and if successful takes user to homepage, otherwise returns then to signin page
app.post('/local-reg', passport.authenticate('local-signup', {
  successRedirect: '/home',
  failureRedirect: '/signin'
  })
);

//sends the request through our local login/signin strategy, and if successful takes user to homepage, otherwise returns then to signin page
app.post('/login', passport.authenticate('local-signin', { 
  successRedirect: '/home',
  failureRedirect: '/signin'
  })
);

app.get('/abc', ensureAuthenticated,function(req, res) {
  res.send("acess granted");
});
//logs user out of site, deleting them from the session, and returns to homepage
app.get('/logout', function(req, res){
  var name = req.user.username;
  console.log("LOGGIN OUT " + req.user.username)
  req.logout();
  res.redirect('/home');
  req.session.notice = "You have successfully been logged out " + name + "!";
});
////


// error handling
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});

initDb(function(err){
  console.log('Error connecting to Mongo. Message:\n'+err);
});

app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);

module.exports = app ;
