const mongoose = require("mongoose");
const userSchema = require("./user");
const mongoosePaginate = require("mongoose-paginate-v2");
const mongoose_fuzzy_searching = require("mongoose-fuzzy-searching");
const { categorySchema } = require("./categories");
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
    categories: [categorySchema], //
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
  { timestamps: true }
);
productSchema.plugin(mongoosePaginate);
productSchema.plugin(mongoose_fuzzy_searching, {
  fields: ["name", "brand"],
});
const Product = mongoose.model("Products", productSchema);

module.exports = {
  productSchema,
  Product,
};
