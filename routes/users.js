var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const Driver = require('../models/driver.model');
const Student = require('../models/student.model');
const Parent = require('../models/parent.model');
const Admin = require('../models/admin.model');
const ctrlUser = require('../authentication/auth');
/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});


router.post('/login', ctrlUser.authenticate);

router.post('/register-student', function (req, res, next) {

  var fullName = req.body.fullname;
  var email = req.body.email;
  var phone_no = req.body.phone_no;
  var schoolAdress = req.body.schoolAdress;
  var homeAdress = req.body.homeAdress;
  var age = req.body.age;
  var gender = req.body.gender;
  var role = "student";
  var password = req.body.password;
  bcrypt.hash(password, 10, function (err, hash) {
    if (err) {
      res.send("Something went wrong! Try Again");
    }
    else {
      var student = new Student({
        fullname: fullName,
        email,
        phone_no,
        schoolAdress,
        homeAdress,
        age,
        gender,
        role,
        password: hash
      });
      student.save((err, doc) => {
        if (!err)
          res.send(doc);
        else {
          if (err.code == 11000)
            res.status(422).send(['Duplicate email adrress found.']);
          else
            return next(err);
        }
      });
    }
  });
});

router.post('/register-parent', function (req, res, next) {

  var fullName = req.body.fullname;
  var email = req.body.email;
  var phone_no = req.body.phone_no;
  var homeAdress = req.body.homeAdress;
  var role = "parent";
  var password = req.body.password;

  bcrypt.hash(password, 10, function (err, hash) {
    if (err) {
      res.send("Something went wrong! Try Again");
    }
    else {
      var parent = new Parent({
        fullname: fullName,
        email,
        phone_no,
        homeAdress,
        role,
        password: hash
      });
      parent.save((err, doc) => {
        if (!err)
          res.send(doc);
        else {
          if (err.code == 11000)
            res.status(422).send(['Duplicate email adrress found.']);
          else
            return next(err);
        }
      });
    }
  });
});

router.post('/register-driver', function (req, res, next) {

  var fullname = req.body.fullname;
  var email = req.body.email;
  var phone_no = req.body.phone_no;
  var address = req.body.address;
  var role = "driver";
  var cnic = req.body.cnic;
  var password = req.body.password;

  bcrypt.hash(password, 10, function (err, hash) {
    if (err) {
      res.send("Something went wrong! Try Again");
    }
    else {
      var driver = new Driver({
        fullname,
        email,
        phone_no,
        address,
        role,
        cnic,
        password: hash
      });
      driver.save((err, doc) => {
        if (!err)
          res.send(doc);
        else {
          if (err.code == 11000)
            res.status(422).send(['Duplicate email adrress found.']);
          else
            return next(err);
        }
      });
    }
  });
});

router.get('/logout', (req, res) => {
  if (req.session) {
      req.session.destroy();
      res.clearCookie('session-id');
      res.redirect('/');
  } else {
      var err = new Error('You are not logged in!');
      err.status = 403;
      next(err);
  }
});


  module.exports = router;
