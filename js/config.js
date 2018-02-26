var bcrypt = require('bcryptjs'),
    Q = require('q');

////get mongourl
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

////
// MongoDB connection information
var mongodbUrl = 'mongodb://' + 'localhost' + ':27117/users';
var mongodbUrl = mongoURL;

var Promise = require('bluebird');
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var Collection = mongodb.Collection;

Promise.promisifyAll(Collection.prototype);
Promise.promisifyAll(MongoClient);


var Config = function() {
    return this;
};

Config.prototype.getMongoURL = function (){
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

    return mongoURL;
}

Config.prototype.getGcCredentials = function(success, failure){
    var deferred = Q.defer();
    console.log('getGcCredentials start');
    console.log('mongourl: ' + mongodbUrl);
    MongoClient.connectAsync(mongodbUrl).then(function(db){
    console.log('MongoClient connected');
    var dbo = db.db("istory");
      var collection = dbo.collection('googleCloudStorage');
      collection.findOneAsync()
        .then(function (result) {
            console.log('gcCredentials: ' + result);
            db.close();
            gcCredentials = result;

            deferred.resolve(gcCredentials);
        });
    }).catch(function(err){
        console.log(err);
        deferred.resolve(false);
    })

    return deferred.promise;
  };

  module.exports = Config;
