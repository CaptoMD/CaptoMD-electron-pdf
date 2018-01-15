const express = require('express');
const morgan = require('morgan');
const electronPdfRoute = require('./route/pdf-route');

const app = express();

app.use(morgan('dev'));
app.use('/', electronPdfRoute);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, _next) => {
  // set locals, only providing error in development
  const { message } = err;
  const error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send({ error, message });
});

module.exports = app;
