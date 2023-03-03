/**
 * Questions:
 * - Is the difference between sessions and cookies? How did they relate?
 * - What is the function of next()?
 *
 */

var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var app = express();

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
const campsiteRouter = require("./routes/campsiteRouter");
const promotionRouter = require("./routes/promotionRouter");
const partnerRouter = require("./routes/partnerRouter");
const passport = require('passport');
const authenticate = require('./authenticate');
const mongoose = require("mongoose");
const config = require('./config');
const url = config.mongoUrl;

// const url = "mongodb://127.0.0.1:27017/nucampsite";
const connect = mongoose.connect(url, {
  useCreateIndex: true,
  useFindAndModify: false,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});




app.use(passport.initialize());

connect.then(
  () => console.log("Connected correctly to server"),
  (err) => console.log(err)
);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// should be in the env file. Is this what firebase
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/campsites", campsiteRouter);
app.use("/promotions", promotionRouter);
app.use("/partners", partnerRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
