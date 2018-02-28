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
          return  cursor.sort({"startTime": 1});
        })
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

Calendar.prototype.insertCalendar = function(title, date, startTime, endTime, content, eventclass){
    var deferred = Q.defer();
    console.log('getCalendar start');
    console.log('mongourl: ' + mongodbUrl);
    MongoClient.connectAsync(mongodbUrl).then(function(db){
    console.log('MongoClient connected');
    var dbo = db.db("istory");
      var collection = dbo.collection('calendar');
      var myobj = 
        { 
          title: title, 
          content: content,
          date: date, 
          dateInt: parseInt(date.split('-')[0] + date.split('-')[1] + date.split('-')[2]),
          startTime: parseInt(startTime.split(':')[0] + startTime.split(':')[1]),
          endTime: parseInt(endTime.split(':')[0] + endTime.split(':')[1]),
          badge: true,
          eventclass: eventclass,
        };
      collection.insertOneAsync(myobj)
        .then(function (result) {
          console.log("1 calendar object is inserted");
          deferred.resolve(true);
        })
    }).catch(function(err){
        console.log(err);
        deferred.resolve(false);
    })

    return deferred.promise;
};
Calendar.prototype.removeCalendarEvent = function(id){
  var deferred = Q.defer();
  console.log('getCalendar start');
  console.log('mongourl: ' + mongodbUrl);
  MongoClient.connectAsync(mongodbUrl).then(function(db){
  console.log('MongoClient connected');
  var dbo = db.db("istory");
    var collection = dbo.collection('calendar');
    var query = 
      {
        "_id": new mongodb.ObjectId(id)
      };
    collection.deleteOne(query)
      .then(function (result) {
        console.log("1 calendar event is removed");
        deferred.resolve(true);
      })
  }).catch(function(err){
      console.log(err);
      deferred.resolve(false);
  })

  return deferred.promise;
};

module.exports = Calendar;
