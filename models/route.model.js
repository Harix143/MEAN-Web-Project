const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const routeSchema = new Schema({
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
  });
  
  var Route = mongoose.model("Route", routeSchema);
  module.exports = Route;