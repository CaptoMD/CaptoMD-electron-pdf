/*
* Copyright (c) 2017 CaptoMD
*/

const fs = require('fs');
const path = require('path');

const JSZip = require('jszip');
const async = require('async');
const debug = require('debug')('electronpdf:captomd:unzip');

function unzip(data, destination) {
  const queue = async.queue(({ relativePath, zipFile }, callback) => {
    const filePath = path.join(destination, relativePath);
    debug('unzipping:', filePath);
    if (zipFile.dir) {
      fs.mkdir(filePath, callback);
    } else {
      zipFile
        .nodeStream()
        .pipe(fs.createWriteStream(filePath))
        .on('finish', callback)
        .on('error', callback);
    }
  });

  return new Promise((resolve, reject) => {
    debug('unzipping at:', destination);

    queue.error = reject;
    queue.drain = () => resolve(destination);

    JSZip.loadAsync(data).then(zip => {
      zip.forEach((relativePath, zipFile) => {
        debug('queue unzip:', relativePath);
        queue.push({ relativePath, zipFile });
      });
    });
  });
}

module.exports = unzip;
