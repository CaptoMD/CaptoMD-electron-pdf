/*
* Copyright (c) 2017 CaptoMD
*/

const fse = require('fs-extra');
const path = require('path');
const os = require('os');

const express = require('express');
const bodyParser = require('body-parser');
const debug = require('debug')('electronpdf:captomd:route');

const electronPdfJob = require('../pdf/electron-pdf-job');
const unzip = require('../util/unzip');

const router = express.Router();

router.use(bodyParser.raw({ type: 'application/zip', limit: '6mb' }));

router.post('/', (req, res, next) => {
  const electronPDF = req.app.get('electronPDF');

  fse.mkdtemp(path.join(os.tmpdir(), 'print-'))
    .then(dir => unzip(req.body, dir))
    .then(dir => electronPdfJob(dir, electronPDF))
    .then((pdf) => {
      debug('pdf', pdf);
      res.setHeader('Content-disposition', `inline; filename="${req.query.filename || 'output.pdf'}"`);
      res.setHeader('Content-type', 'application/pdf');
      res.send(pdf);
    })
    .catch((error) => {
      debug('PDF error', error);
      next(error);
    });
});

module.exports = router;
