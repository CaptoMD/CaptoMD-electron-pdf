/*
 * Copyright (c) 2017 CaptoMD
 */

const path = require('path');
const fs = require('fs');
const debug = require('debug')('electronpdf:captomd:job');

function electronPdfJob(workDir, electronPDF) {
  const options = {
    printBackground: true,
    disableCache: true,
    waitForJSEvent: 'view-ready',
    pageSize: 'Letter' // Needed for things to work…
  };
  const jobOptions = {
    inMemory: true,
    closeWindow: false
  };
  const source = path.join(workDir, 'index.html');

  debug('electronPDF.createJob()', source, workDir, options, jobOptions);
  return electronPDF.createJob(source, workDir, options, jobOptions).then(
    job =>
      new Promise((resolve, reject) => {
        debug('electron PDF job begin...');

        job.on('job-complete', result => {
          debug('electron PDF job complete...', result);

          // Send the Buffer here
          process.nextTick(() => {
            fs.unlink(workDir, () => debug(`work directory ${workDir} deleted`));
            debug('electron PDF job.destroy()...');
            job.destroy();
          });

          if (result.error) {
            reject(result.error);
          } else {
            resolve(result.results[0]);
          }
        });

        debug('electron PDF job.render()...');
        job.render();
      })
  );
}

module.exports = electronPdfJob;
