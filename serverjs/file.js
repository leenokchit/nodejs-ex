var Q = require('q');

function File(name = '') {
  this.name = name;
}



File.prototype.listFiles = function(bucketName, storage) {
  var deferred = Q.defer();
  // [START storage_list_files]
  // Imports the Google Cloud client library
  const Storage = require('@google-cloud/storage');

  // Creates a client
  //const storage = new Storage();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const bucketName = 'Name of a bucket, e.g. my-bucket';

  // Lists files in the bucket
  storage
    .bucket(bucketName)
    .getFiles()
    .then(results => {
      const files = results[0];

      console.log('Files:');
      files.forEach(file => {
        console.log(file.name);
      });
      deferred.resolve({files: results[0], isValid: true});
    })
    .catch(err => {
      console.error('ERROR:', err);
      deferred.resolve({isValid: true, errMessage: err});
    });
  // [END storage_list_files]

  return deferred.promise;
}


// GcFile.prototype.listFilesByPrefix = function(bucketName, prefix, delimiter) {
//   // [START storage_list_files_with_prefix]
//   // Imports the Google Cloud client library
//   const Storage = require('@google-cloud/storage');

//   // Creates a client
//   const storage = new Storage();

//   /**
//    * TODO(developer): Uncomment the following lines before running the sample.
//    */
//   // const bucketName = 'Name of a bucket, e.g. my-bucket';
//   // const prefix = 'Prefix by which to filter, e.g. public/';
//   // const delimiter = 'Delimiter to use, e.g. /';

//   /**
//    * This can be used to list all blobs in a "folder", e.g. "public/".
//    *
//    * The delimiter argument can be used to restrict the results to only the
//    * "files" in the given "folder". Without the delimiter, the entire tree under
//    * the prefix is returned. For example, given these blobs:
//    *
//    *   /a/1.txt
//    *   /a/b/2.txt
//    *
//    * If you just specify prefix = '/a', you'll get back:
//    *
//    *   /a/1.txt
//    *   /a/b/2.txt
//    *
//    * However, if you specify prefix='/a' and delimiter='/', you'll get back:
//    *
//    *   /a/1.txt
//    */
//   const options = {
//     prefix: prefix,
//   };

//   if (delimiter) {
//     options.delimiter = delimiter;
//   }

//   // Lists files in the bucket, filtered by a prefix
//   storage
//     .bucket(bucketName)
//     .getFiles(options)
//     .then(results => {
//       const files = results[0];

//       console.log('Files:');
//       files.forEach(file => {
//         console.log(file.name);
//       });
//     })
//     .catch(err => {
//       console.error('ERROR:', err);
//     });
//   // [END storage_list_files_with_prefix]
// }

// GcFile.prototype.uploadFile = function(bucketName, filename) {
//   // [START storage_upload_file]
//   // Imports the Google Cloud client library
//   const Storage = require('@google-cloud/storage');

//   // Creates a client
//   const storage = new Storage();

//   /**
//    * TODO(developer): Uncomment the following lines before running the sample.
//    */
//   // const bucketName = 'Name of a bucket, e.g. my-bucket';
//   // const filename = 'Local file to upload, e.g. ./local/path/to/file.txt';

//   // Uploads a local file to the bucket
//   storage
//     .bucket(bucketName)
//     .upload(filename)
//     .then(() => {
//       console.log(`${filename} uploaded to ${bucketName}.`);
//     })
//     .catch(err => {
//       console.error('ERROR:', err);
//     });
//   // [END storage_upload_file]
// }

// GcFile.prototype.downloadFile = function(bucketName, srcFilename, destFilename) {
//   // [START storage_download_file]
//   // Imports the Google Cloud client library
//   const Storage = require('@google-cloud/storage');

//   // Creates a client
//   const storage = new Storage();

//   /**
//    * TODO(developer): Uncomment the following lines before running the sample.
//    */
//   // const bucketName = 'Name of a bucket, e.g. my-bucket';
//   // const srcFilename = 'Remote file to download, e.g. file.txt';
//   // const destFilename = 'Local destination for file, e.g. ./local/path/to/file.txt';

//   const options = {
//     // The path to which the file should be downloaded, e.g. "./file.txt"
//     destination: destFilename,
//   };

//   // Downloads the file
//   storage
//     .bucket(bucketName)
//     .file(srcFilename)
//     .download(options)
//     .then(() => {
//       console.log(
//         `gs://${bucketName}/${srcFilename} downloaded to ${destFilename}.`
//       );
//     })
//     .catch(err => {
//       console.error('ERROR:', err);
//     });
//   // [END storage_download_file]
// }

// GcFile.prototype.deleteFile = function(bucketName, filename) {
//   // [START storage_delete_file]
//   // Imports the Google Cloud client library
//   const Storage = require('@google-cloud/storage');

//   // Creates a client
//   const storage = new Storage();

//   /**
//    * TODO(developer): Uncomment the following lines before running the sample.
//    */
//   // const bucketName = 'Name of a bucket, e.g. my-bucket';
//   // const filename = 'File to delete, e.g. file.txt';

//   // Deletes the file from the bucket
//   storage
//     .bucket(bucketName)
//     .file(filename)
//     .delete()
//     .then(() => {
//       console.log(`gs://${bucketName}/${filename} deleted.`);
//     })
//     .catch(err => {
//       console.error('ERROR:', err);
//     });
//   // [END storage_delete_file]
// }

// GcFileFile.prototype.getMetadata = function(bucketName, filename) {
//   // [START storage_get_metadata]
//   // Imports the Google Cloud client library
//   const Storage = require('@google-cloud/storage');

//   // Creates a client
//   const storage = new Storage();

//   /**
//    * TODO(developer): Uncomment the following lines before running the sample.
//    */
//   // const bucketName = 'Name of a bucket, e.g. my-bucket';
//   // const filename = 'File to access, e.g. file.txt';

//   // Gets the metadata for the file
//   storage
//     .bucket(bucketName)
//     .file(filename)
//     .getMetadata()
//     .then(results => {
//       const metadata = results[0];

//       console.log(`File: ${metadata.name}`);
//       console.log(`Bucket: ${metadata.bucket}`);
//       console.log(`Storage class: ${metadata.storageClass}`);
//       console.log(`Self link: ${metadata.selfLink}`);
//       console.log(`ID: ${metadata.id}`);
//       console.log(`Size: ${metadata.size}`);
//       console.log(`Updated: ${metadata.updated}`);
//       console.log(`Generation: ${metadata.generation}`);
//       console.log(`Metageneration: ${metadata.metageneration}`);
//       console.log(`Etag: ${metadata.etag}`);
//       console.log(`Owner: ${metadata.owner}`);
//       console.log(`Component count: ${metadata.component_count}`);
//       console.log(`Crc32c: ${metadata.crc32c}`);
//       console.log(`md5Hash: ${metadata.md5Hash}`);
//       console.log(`Cache-control: ${metadata.cacheControl}`);
//       console.log(`Content-type: ${metadata.contentType}`);
//       console.log(`Content-disposition: ${metadata.contentDisposition}`);
//       console.log(`Content-encoding: ${metadata.contentEncoding}`);
//       console.log(`Content-language: ${metadata.contentLanguage}`);
//       console.log(`Metadata: ${metadata.metadata}`);
//       console.log(`Media link: ${metadata.mediaLink}`);
//     })
//     .catch(err => {
//       console.error('ERROR:', err);
//     });
//   // [END storage_get_metadata]
// }

// GcFile.prototype.makePublic = function(bucketName, filename) {
//   // [START storage_make_public]
//   // Imports the Google Cloud client library
//   const Storage = require('@google-cloud/storage');

//   // Creates a client
//   const storage = new Storage();

//   /**
//    * TODO(developer): Uncomment the following lines before running the sample.
//    */
//   // const bucketName = 'Name of a bucket, e.g. my-bucket';
//   // const filename = 'File to make public, e.g. file.txt';

//   // Makes the file public
//   storage
//     .bucket(bucketName)
//     .file(filename)
//     .makePublic()
//     .then(() => {
//       console.log(`gs://${bucketName}/${filename} is now public.`);
//     })
//     .catch(err => {
//       console.error('ERROR:', err);
//     });
//   // [END storage_make_public]
// }

// GcFile.prototype.generateSignedUrl = function(bucketName, filename) {
//   // [START storage_generate_signed_url]
//   // Imports the Google Cloud client library
//   const Storage = require('@google-cloud/storage');

//   // Creates a client
//   const storage = new Storage();

//   /**
//    * TODO(developer): Uncomment the following lines before running the sample.
//    */
//   // const bucketName = 'Name of a bucket, e.g. my-bucket';
//   // const filename = 'File to access, e.g. file.txt';

//   // These options will allow temporary read access to the file
//   const options = {
//     action: 'read',
//     expires: '03-17-2025',
//   };

//   // Get a signed URL for the file
//   storage
//     .bucket(bucketName)
//     .file(filename)
//     .getSignedUrl(options)
//     .then(results => {
//       const url = results[0];

//       console.log(`The signed url for ${filename} is ${url}.`);
//     })
//     .catch(err => {
//       console.error('ERROR:', err);
//     });
//   // [END storage_generate_signed_url]
// }

// GcFile.prototype.moveFile = function(bucketName, srcFilename, destFilename) {
//   // [START storage_move_file]
//   // Imports the Google Cloud client library
//   const Storage = require('@google-cloud/storage');

//   // Creates a client
//   const storage = new Storage();

//   /**
//    * TODO(developer): Uncomment the following lines before running the sample.
//    */
//   // const bucketName = 'Name of a bucket, e.g. my-bucket';
//   // const srcFilename = 'File to move, e.g. file.txt';
//   // const destFilename = 'Destination for file, e.g. moved.txt';

//   // Moves the file within the bucket
//   storage
//     .bucket(bucketName)
//     .file(srcFilename)
//     .move(destFilename)
//     .then(() => {
//       console.log(
//         `gs://${bucketName}/${srcFilename} moved to gs://${bucketName}/${destFilename}.`
//       );
//     })
//     .catch(err => {
//       console.error('ERROR:', err);
//     });
//   // [END storage_move_file]
// }

// GcFile.prototype.copyFile = function(srcBucketName, srcFilename, destBucketName, destFilename) {
//   // [START storage_copy_file]
//   // Imports the Google Cloud client library
//   const Storage = require('@google-cloud/storage');

//   // Creates a client
//   const storage = new Storage();

//   /**
//    * TODO(developer): Uncomment the following lines before running the sample.
//    */
//   // const srcBucketName = 'Name of the source bucket, e.g. my-bucket';
//   // const srcFilename = 'Name of the source file, e.g. file.txt';
//   // const destBucketName = 'Name of the destination bucket, e.g. my-other-bucket';
//   // const destFilename = 'Destination name of file, e.g. file.txt';

//   // Copies the file to the other bucket
//   storage
//     .bucket(srcBucketName)
//     .file(srcFilename)
//     .copy(storage.bucket(destBucketName).file(destFilename))
//     .then(() => {
//       console.log(
//         `gs://${srcBucketName}/${srcFilename} copied to gs://${destBucketName}/${destFilename}.`
//       );
//     })
//     .catch(err => {
//       console.error('ERROR:', err);
//     });
//   // [END storage_copy_file]
//   }
  



  module.exports = File;