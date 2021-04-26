const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const categorySchema = new Schema(
  {
    name: {
      //
      type: String,
      required: true,
    },
    child: [String],
    image: {
      //
      type: String,
    },
  },
  {
    timestamp: true,
  }
);

const Category = new mongoose.model("Categories", categorySchema);

// module.exports.categorySchema = categorySchema;
// module.exports.Category = Category;
module.exports = {
  categorySchema,
  Category,
};
