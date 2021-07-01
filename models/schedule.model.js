const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const schduleSchema = new Schema({
    schoolStartingTime: {
      type: String,
      required: true,
    },
    schoolClosingTime: {
      type: String,
      required: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
    },
  });
  
  var Schedule = mongoose.model("Schedule", schduleSchema);
  module.exports = Schedule;