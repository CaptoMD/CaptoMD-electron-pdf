const app = require('./app');
const http = require('http');
const ElectronPDF = require('electron-pdf');

/**
 * Get port from environment and store in Express.
 */
const port = process.env.PORT || 9645;
app.set('port', port);

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string'
    ? `Pipe ${port}`
    : `Port ${port}`;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
      // eslint-disable-next-line no-unreachable
      break;
    case 'EADDRINUSE':
      console.error(`${bind} is already in use`);
      process.exit(1);
      // eslint-disable-next-line no-unreachable
      break;
    default:
      throw error;
  }
}

const electronPDF = new ElectronPDF();
app.set('electronPDF', electronPDF);

const server = http.createServer(app);
server.on('error', onError);

// wait for electronPDF
electronPDF.on('charged', () => {
  server.listen(port);
  console.info(`Electron PDF started. Listening on port: ${port}`);
});

console.info('starting Electron PDF.');
electronPDF.start();
