var bcrypt = require('bcryptjs'),
    Q = require('q');

var mongodbUrl = '';

var Calendar = function(connection_string = '') {
  mongodbUrl = connection_string;
   return this;
};


var Promise = require('bluebird');
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var Collection = mongodb.Collection;

Promise.promisifyAll(Collection.prototype);
Promise.promisifyAll(mongodb)
Promise.promisifyAll(MongoClient);


Calendar.prototype.getCalendar = function(startDate = 0, endDate = 99999999){
    var deferred = Q.defer();
    console.log('getCalendar start');
    console.log('mongourl: ' + mongodbUrl);
    MongoClient.connectAsync(mongodbUrl).then(function(db){
    console.log('MongoClient connected');
    var dbo = db.db("istory");
      var collection = dbo.collection('calendar');
      var query = {};
      //if(startDate != 0 && endDate != 99999999)
      {
        query = {$and:[{"dateInt": {$gte: startDate}},{"dateInt": {$lte: endDate}}]}
      }
      collection.findAsync(query)
        .then(function (cursor) {
          return  cursor.toArrayAsync() 
        })
        .then(function(content){
          deferred.resolve(content);
        });
    }).catch(function(err){
        console.log(err);
        deferred.resolve(false);
    })

    return deferred.promise;
  };

  module.exports = Calendar;
