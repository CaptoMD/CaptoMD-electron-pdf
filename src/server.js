/*
* Copyright (c) 2017 CaptoMD
*/

// Loosely based on https://github.com/shankie-san/express-electron-pdf

const express = require('express');
const bodyParser = require('body-parser');
const fsXtra = require('fs-extra');
const path = require('path');
const decompress = require('decompress');
const decompressUnzip = require('decompress-unzip');
const uuidv4 = require('uuid/v4');
const config = require('./config');

class Server {

    /**
     *
     * @param {ElectronPDF} exporter
     */
    constructor (exporter) {
        this.exporter = exporter;
        this.init();
    }

    /**
     *
     */
    init () {
        this.app = express();
        this.app.use(bodyParser.raw({
            type: 'application/zip',
            limit: '4mb'
        }));
        this.app.disable('x-powered-by');

        // Catchall middleware:
        this.app.use((req, res, next) =>
        {
            if (req.method !== 'POST')
            {
                Server.sendError(405, new Error(`Method ${req.method} Not Allowed`), req, res);
            }

            if (req.path !== '/')
            {
                Server.sendError(401, new Error(`Not Found`), req, res);
            }

            next();
        });

        // Main route:
        this.app.post('/', (req, res) =>
        {
            const uuid = uuidv4();
            const tempZipFolder = path.join(config.TMP_FOLDER, uuid);
            const tempZipFile = `${tempZipFolder}.zip`;

            fsXtra.writeFile(tempZipFile, req.body, (wfError) =>
            {
                if (wfError)
                {
                    Server.sendError(500, wfError, req, res);
                }

                decompress(tempZipFile, tempZipFolder, {
                    plugins: [
                        decompressUnzip()
                    ]
                }).then(() =>
                {
                    console.log(`Unzip done for ${tempZipFile}`);

                    try
                    {
                        fsXtra.unlinkSync(tempZipFile);
                    }
                    catch (zipErr)
                    {
                        Server.sendError(417, zipErr, req, res);
                        return;
                    }

                    console.log(`File ${tempZipFile} deleted`);

                    const jobOptions = {
                        /**
                         r.results[] will contain the following based on inMemory
                         false: the fully qualified path to a PDF file on disk
                         true: The Buffer Object as returned by Electron

                         Note: the default is false, this can not be set using the CLI
                         */
                        inMemory: false
                    }
                    const options = {
                        printBackground : true,
                        disableCache : true,
                        waitForJSEvent : 'view-ready',
                        pageSize : 'Letter', // Needed for things to work…
                    };
                    const inputFile = path.join(tempZipFolder, 'index.html');
                    const outputFile = path.join(config.TMP_FOLDER, `${uuid}.pdf`);

                    try
                    {
                        console.log(`exporter.createJob ${inputFile} > ${outputFile}`);
                        this.exporter.createJob(inputFile, outputFile, options, jobOptions).then((job) =>
                        {
                            console.log('Beginning job…');
                            job.on('job-complete', (r) =>
                            {
                                console.log('pdf files:', r.results);
                                res.download(outputFile, 'content.pdf', () =>
                                {
                                    // Successfully downloaded. Delete working files:
                                    console.log('Download succeeded!');
                                    fsXtra.remove(tempZipFolder, (rmErr) => {
                                        if (rmErr)
                                        {
                                            console.error(rmErr);
                                            return;
                                        }
                                        console.log(`Folder ${tempZipFolder} deleted`);
                                    });
                                    fsXtra.unlink(outputFile, (ulErr) => {
                                        if (ulErr)
                                        {
                                            console.error(ulErr);
                                            return;
                                        }
                                        console.log(`File ${outputFile} deleted`);
                                    });
                                });
                            })
                            job.render();
                            console.log('job.render() …');
                        }).catch((exErr) =>
                        {
                            Server.sendError(500, exErr, req, res);
                        });
                    }
                    catch (jobErr)
                    {
                        Server.sendError(417, jobErr, req, res);
                    }

                }).catch((reason) =>
                {
                    console.error(reason);
                    Server.sendError(501, new Error(reason), req, res);
                });
            });
        });

        // Error-handling middleware (always takes four arguments):
        this.app.use((err, req, res, next) =>
        {
            const status = 400;
            Server.sendError(status, err, req, res);
        });
    }

    /**
     *
     * @param {int} status
     * @param {Error} err
     * @param req
     * @param res
     */
    static sendError (status, err, req, res)
    {
        const userAgent = req.header('user-agent');
        const requester = `[${req.method}] ${req.protocol}://${req.header('host')}${req.url}`;
        // Error as message:
        const message = err.message;

        console.error(err);
        res.status(status).send({error: true, message, request: requester, userAgent});
    }

    /**
     *
     * @param {int} port
     */
    start (port) {
        if (this.app)
        {
            this.app.listen(port, () => {
                console.info(`Listening on port ${port} …`);
            });
        }
    }
}

module.exports = Server;
