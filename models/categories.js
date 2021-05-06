const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;
const categorySchema = new Schema(
  {
    name: {
      //
      type: String,
      required: true,
    },
    parent: {
      type: ObjectId,
    },
    child: [ObjectId], //trash
    image: {
      //
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Category = mongoose.model("Categories", categorySchema);

// module.exports.categorySchema = categorySchema;
// module.exports.Category = Category;
module.exports = {
  categorySchema,
  Category,
};
