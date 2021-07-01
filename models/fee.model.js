const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const feeSchema = new Schema({
  dueAmount: {
    type: String,
    required: true,
  },
  dueDate: {
    type: String,
    required: true,
  },
  paidAmount: {
    type: String,
  },
});

var Fees = mongoose.model("Fees", feeSchema);
module.exports = Fees;
