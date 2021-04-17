const mongoose = require("mongoose");
const userSchema = require("./user");
const { imageSchema } = require("./image");
const Schema = mongoose.Schema;
const productSchema = new Schema(
  {
    name: {
      //
      type: String,
      required: true,
    },
    desc: {
      //
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
    categories: [String], //
    price: {
      //
      type: Number,
      default: 0,
    },
    brand: {
      //
      type: String,
      required: true,
    },
    available: {
      type: Number,
      default: 0,
    },
    images: [String], //
    seller: userSchema, //
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
