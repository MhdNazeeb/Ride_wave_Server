const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors')

const corsOptions = {
  origin: 'https://master.d2js3xk7a7outs.amplifyapp.com',
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions))

const adminRouter = require('./routes/admin');
const usersRouter = require('./routes/user');
const driverRouter = require('./routes/driver');
const chatRouter = require('./routes/chat')
const messageRouter = require('./routes/Message')


const mongoDB = require('./config/db')

mongoDB()

app.use(logger('dev'));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(cookieParser());
app.use('/', usersRouter);
app.use('/admin', adminRouter);
app.use('/driver', driverRouter);
app.use('/chat',chatRouter)
app.use('/message',messageRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



app.listen(process.env.PORT, function(err){
  if (err) console.log("Error in server setup")
  console.log("Server listening on Port", process.env.PORT);
})

module.exports = app;
