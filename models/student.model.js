const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const studentSchema = new Schema({
  fullname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  phone_no: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true
  },
  schoolAdress: {
    type: String,
    required: true,
  },
  homeAdress: {
    type: String,
    required: true,
  },
  age: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  assignedDriver: {
    type: Schema.Types.ObjectId,
    ref: "Driver",
  },
  parent: {
    type: Schema.Types.ObjectId,
    ref: "Parent",
  },
  role: {
    type: String,
    required: true,
    lowercase: true
  }
});

// Methods
studentSchema.methods.verifyPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

studentSchema.methods.generateJwt = function () {
  return jwt.sign({ _id: this._id, email: this.email, role: this.role, fullname:  this.fullname },
    "secret-of-roy",
    {
      expiresIn: "1h"
    });
}


var Student = mongoose.model("Student", studentSchema);
module.exports = Student;