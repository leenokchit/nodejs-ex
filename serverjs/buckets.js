var Q = require('q');

function Bucket(name = '') {
  this.name = name;
}




Bucket.prototype.createBucket = function(bucketName, storage) {
      // [START storage_create_bucket]
      // Imports the Google Cloud client library
      const Storage = require('@google-cloud/storage');

      // Creates a client
      //const storage = new Storage();

      /**
       * TODO(developer): Uncomment the following line before running the sample.
       */
      // const bucketName = 'Name of a bucket, e.g. my-bucket';

      // Creates a new bucket
      storage
        .createBucket(bucketName)
        .then(() => {
          console.log(`Bucket ${bucketName} created.`);
        })
        .catch(err => {
          console.error('ERROR:', err);
        });
      // [END storage_create_bucket]
  }

  Bucket.prototype.listBuckets = function(storage) {
      var deferred = Q.defer();

      // [START storage_list_buckets]
      // Imports the Google Cloud client library
      const Storage = require('@google-cloud/storage');

      // Creates a client
      //const storage = new Storage();

      // Lists all buckets in the current project
      storage
        .getBuckets()
        .then(results => {
          const buckets = results[0];
          
          deferred.resolve(buckets);
          // console.log('Buckets:');
          // buckets.forEach(bucket => {
          //   console.log(bucket.name);
          // });
        })
        .catch(err => {
          console.error('ERROR:', err);
          deferred.resolve(false);
        });
      // [END storage_list_buckets]

      return deferred.promise;
  },

  Bucket.prototype.deleteBucket = function(bucketName) {
      // [START storage_delete_bucket]
      // Imports the Google Cloud client library
      const Storage = require('@google-cloud/storage');

      // Creates a client
      //const storage = new Storage();

      /**
       * TODO(developer): Uncomment the following line before running the sample.
       */
      // const bucketName = 'Name of a bucket, e.g. my-bucket';

      // Deletes the bucket
      storage
        .bucket(bucketName)
        .delete()
        .then(() => {
          console.log(`Bucket ${bucketName} deleted.`);
        })
        .catch(err => {
          console.error('ERROR:', err);
        });
      // [END storage_delete_bucket]
  }

  module.exports = Bucket;