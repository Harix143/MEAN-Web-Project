const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const complaintSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  Feedback: {
    type: String,
  },
  driverId: {
    type: Schema.Types.ObjectId,
    ref: "Driver",
  },
  studentId: {
    type: Schema.Types.ObjectId,
    ref: "Student",
  },
  parentId: {
    type: Schema.Types.ObjectId,
    ref: "Parent",
  },
});

var Complaint = mongoose.model("Complaint", complaintSchema);
module.exports = Complaint;
