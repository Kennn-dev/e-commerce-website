const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    desc: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      default: 0.0,
    },
    like: {
      type: Number,
      default: 0,
    },
    categories: [String],
    price: {
      type: String, ////
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    available: {
      type: Number,
      default: 0,
    },
    //// Seller ???
    sold: {
      type: String,
      default: 0,
    },
  },
  {
    timestamp: true,
  }
);

const Product = new mongoose.model("Products", productSchema);

module.exports.productSchema = productSchema;
module.exports.Product = Product;
