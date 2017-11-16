/*
 * Copyright (c) 2017 CaptoMD
 */

const ElectronPDF = require('electron-pdf');
const Server = require('./server');
const config = require('./config');

const PORT = process.env.ELECTRON_PDF_SERVICE_PORT || config.PORT || 9645;
const exporter = new ElectronPDF();

//Only start the express server once the exporter is ready
exporter.on('charged', () =>
{
    server.start(PORT);
});

const server = new Server(exporter);
exporter.start()
