const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const leaveSchema = new Schema({
  onLeave: {
    type: Boolean,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  studentID: {
    type: Schema.Types.ObjectId,
    ref: "Student",
  },
});

var Leave = mongoose.model("Leave", leaveSchema);
module.exports = Leave;
