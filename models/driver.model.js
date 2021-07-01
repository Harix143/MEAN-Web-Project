const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Schema = mongoose.Schema;

const driverSchema = new Schema({
  fullname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim : true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  phone_no: {
    type: String,
    required: true,
    unique: true,
    trim : true
  },
  password:{
    type : String,
    required : true
  },
  cnic: {
    type: String,
    required: true,
    unique: true,
  },
  address: {
    type: String,
    required: true,
    trim : true
  },
  assignedVan: {
    type: Schema.Types.ObjectId,
    ref: "Van",
  },
  assignedRoute: {
    type: Schema.Types.ObjectId,
    ref: "Route",
  },
  
  role :{
    type : String,
    required : true,
    lowercase : true
  }
});

// Methods
driverSchema.methods.verifyPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

driverSchema.methods.generateJwt = function () {
  return jwt.sign({ _id: this._id, email: this.email, role: this.role, fullname: this.fullname  },
    "secret-of-roy",
    {
      expiresIn: "1h"
    });
}


var Driver = mongoose.model("Driver", driverSchema);
module.exports = Driver;