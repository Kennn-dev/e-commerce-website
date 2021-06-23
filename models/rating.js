const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ratingSchema = new Schema(
  {
    productId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);
let Rating = mongoose.model("Ratings", ratingSchema);

module.exports = {
  ratingSchema,
  Rating,
};
