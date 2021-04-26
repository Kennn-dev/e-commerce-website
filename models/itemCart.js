const mongoose = require("mongoose");
const { productSchema } = require("./product");
const Schema = mongoose.Schema;

const itemCartSchema = new Schema(
  {
    product: productSchema,
    quantity: {
      type: Number,
      default: 0,
    },
    amount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamp: true,
  }
);

const ItemCart = new mongoose.model("ItemCarts", itemCartSchema);
// module.exports.itemCartSchema = itemCartSchema;
// module.exports.ItemCart = ItemCart;
module.exports = {
  itemCartSchema,
  ItemCart,
};
