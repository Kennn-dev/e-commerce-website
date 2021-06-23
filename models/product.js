const mongoose = require("mongoose");
const userSchema = require("./user");
const mongoosePaginate = require("mongoose-paginate-v2");
const mongoose_fuzzy_searching = require("mongoose-fuzzy-searching");
const { categorySchema } = require("./categories");
const mongooseAlgolia = require("mongoose-algolia");
const Schema = mongoose.Schema;
const { algoliaConfig } = require("./plugins");

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
productSchema.plugin(mongooseAlgolia, {
  appId: process.env.ALGOLIA_APP_ID,
  apiKey: process.env.ALGOLIA_API_KEY,
  debug: true,
  indexName: "dev_cartya",
  defaults: {
    name: "unknown",
    brand: "unknow",
    categories: "unknow",
  },
  mappings: {
    categories: function (value) {
      //Value is the 'namecategories' array ?
      // return value.map((val) => val.name).join(" < ");
      return value.map((val) => val.name);
    },
  },
});
let Product = mongoose.model("Products", productSchema);

// Product.SyncToAlgolia();
module.exports = {
  productSchema,
  Product,
};
