const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const imageSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  contentType: {
    type: String,
    required: true,
  },
  base64: {
    type: String,
    required: true,
  },
});

const Image = new mongoose.model("Images", imageSchema);
module.exports.imageSchema = imageSchema;
module.exports.Image = Image;
