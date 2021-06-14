const mongoose = require("mongoose");
const { itemCartSchema } = require("./itemCart");
const { userSchema } = require("./user");
const Schema = mongoose.Schema;
const orderSchema = new Schema(
  {
    userOrder: userSchema,
    phone: String,
    address: String,
    notice: String,
    checkoutPayment: {
      type: String,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    orderTime: {
      type: Date,
      required: true,
    },
    products: [itemCartSchema],
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Orders", orderSchema);

module.exports = { Order };
