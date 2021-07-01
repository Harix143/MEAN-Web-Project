const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const vanSchema = new Schema({
    vanNumber: {
      type: String,
      required: true,
      unique: true,
    },
    vanModel: {
      type: String,
      required: true,
    },
    sittingCapacity: {
      type: Number,
      required: true,
    },
    air_condition: {
      type: Boolean,
      required: true,
    },
  });
  
  var Van = mongoose.model("Van", vanSchema);
  module.exports = Van;