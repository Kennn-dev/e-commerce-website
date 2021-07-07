const mongoose = require("mongoose");
const { userSchema } = require("./user");
const Schema = mongoose.Schema;

const commentSchema = new Schema(
  {
    productId: {
      type: String,
      required: true,
    },
    user: userSchema,
    content: String,
    media: [],
  },
  { timestamps: true }
);
let Comment = mongoose.model("Comments", commentSchema);

module.exports = {
  commentSchema,
  Comment,
};
