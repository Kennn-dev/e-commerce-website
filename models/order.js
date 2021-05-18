import mongoose, { Schema } from "mongoose";
import { userSchema } from "./user";
import { itemCartSchema } from "./itemCart";

const orderSchema = new Schema(
  {
    userOrder: userSchema,
    totalAmount: {
      type: Number,
      required: true,
    },
    orderStatus: {
      type: String,
      required: true,
    },
    orderTime: {
      type: Date,
      required: true,
    },
    isCheckout: {
      type: Boolean,
      default: false,
    },
    products: [itemCartSchema],
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Orders", orderSchema);

export default Order;
