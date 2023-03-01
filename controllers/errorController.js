const AppError = require('./../utils/appError');

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = err => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0]; //this a regular expression that matchs text between quotes
  console.log(value);

  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};
const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () => new AppError('invalide token please log in again', 401);

const handleJWTExpiredError = () => new AppError('Your token has expired! log in again', 401);

const sendErrorDev = (err, req, res) => {
  //API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
    // RENSEDR WEBSITE
  }
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong',
    msg: err.message,
  });

};

const sendErrorProd = (err, req, res) => {
  //1 API
  if (req.originalUrl.startsWith('/api')) {
    // operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });

      // Programming or other unknown error: don't leak error details
    }
    // 1) Log error
    console.error('ERROR', err);

    // 2) Send generic message
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
  //2 RENDRED WEB STITE
  if (err.isOperational) {
    console.log(err.message);
    return res.status(err.statusCode).render('error', {
      title: 'Something went very wrong',
      msg: err.message,
    });
  }
  // Programming or other unknown error: don't leak error details
  // 1) Log error
  console.error('ERROR', err);
  // 2) Send generic message
  res.status(err.statusCode).render('error', {
    title: 'Something went very wrong!',
    msg: 'please try again later',
  });

};

module.exports = (err, req, res, next) => {
  // console.log(err.stack);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    if (error.name === 'CastError') err = handleCastErrorDB(err);
    if (error.code === 11000) err = handleDuplicateFieldsDB(err);
    if (error.name === 'ValidationError') err = handleValidationErrorDB(err);
    if (error.name === 'JsonWebTokenError') err = handleJWTError();
    if (error.name === 'TokenExpiredError') err = handleJWTExpiredError();
    sendErrorProd(err, req, res);
  }
};
