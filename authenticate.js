var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
const Driver = require("../models/driver.model");
const Student = require("../models/student.model");
const Parent = require("../models/parent.model");
const Admin = require("../models/admin.model");
var JwtStrategy = require("passport-jwt").Strategy;
var ExtractJwt = require("passport-jwt").ExtractJwt;
var jwt = require("jsonwebtoken"); // used to create, sign, and verify tokens

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
exports.getToken = function (user) {
  return jwt.sign(user, "roy-secret", { expiresIn: "1h" });
};
var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = "roy-secret";
passport.use(
  new JwtStrategy(opts, function (jwt_payload, done) {
    var role = jwt_payload.role;
    if (role == "admin") {
      Admin.findOne({ _id: jwt_payload._id }, function (err, user) {
        if (err) {
          return done(err, false);
        }
        if (user) {
          return done(null, user);
        } else {
          return done(null, false);
          // or you could create a new account
        }
      });
    } else if (role == "student") {
      Student.findOne({ _id: jwt_payload._id }, function (err, user) {
        if (err) {
          return done(err, false);
        }
        if (user) {
          return done(null, user);
        } else {
          return done(null, false);
          // or you could create a new account
        }
      });
    } else if (role == "Parent") {
      Parent.findOne({ _id: jwt_payload._id }, function (err, user) {
        if (err) {
          return done(err, false);
        }
        if (user) {
          return done(null, user);
        } else {
          return done(null, false);
          // or you could create a new account
        }
      });
    } else if (role == "driver") {
      Driver.findOne({ _id: jwt_payload._id }, function (err, user) {
        if (err) {
          return done(err, false);
        }
        if (user) {
          return done(null, user);
        } else {
          return done(null, false);
          // or you could create a new account
        }
      });
    }
  })
);

exports.verifyUser = passport.authenticate("jwt", { session: false });

exports.verifyAdmin = (req, res, next) => {
  console.log(req.user._id);
  User.findOne({ _id: req.user._id }, (err, user) => {
    console.log(user.admin);
    if (err) {
      return next(err);
    } else if (user.admin) {
      return next();
    } else {
      res.send("You are not allowed to perform this operation");
    }
  });
};
