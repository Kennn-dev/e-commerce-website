const mongoose = require("mongoose");
const { productSchema } = require("./product");
const { userSchema } = require("./user");
const Schema = mongoose.Schema;

const itemCartSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    product: productSchema,
    quantity: {
      type: Number,
      default: 0,
    },
    amount: {
      type: Number,
      default: 0,
    },
    orderStatus: {
      type: String,
      enum: ["prepare", "shipping", "checkout", "cancel"],
      default: "prepare",
    },
    isCheckout: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const ItemCart = mongoose.model("ItemCarts", itemCartSchema);
// module.exports.itemCartSchema = itemCartSchema;
// module.exports.ItemCart = ItemCart;
module.exports = {
  itemCartSchema,
  ItemCart,
};
