require("./authentication/passportConfig");
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const mongoose = require("mongoose");
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var adminRouter = require("./routes/admin");
var studentRouter = require("./routes/student");
var driverRouter = require("./routes/driver");
var parentRouter = require("./routes/parent");
const passport = require("passport");
var app = express();
var cors = require("cors");
app.use(cors());

const connection = mongoose.connect("mongodb://localhost:27017/svtats");
connection.then(
  (db) => {
    console.log("Connected successfully to database");
  },
  (err) => {
    console.log(err);
  }
);
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");
app.use(passport.initialize());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/admin", adminRouter);
app.use("/student", studentRouter);
app.use("/driver", driverRouter);
app.use("/parent", parentRouter);

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
