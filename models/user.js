const mongoose = require("mongoose");
const { itemCartSchema } = require("./itemCart");
// const roles = ["producer", "customer"];

const Schema = mongoose.Schema;
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    userImage: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    address: {
      type: String,
    },
    currentCart: [itemCartSchema],
    role: {
      type: String,
      default: "Customer",
    }, /// ???
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("Users", userSchema);
module.exports = {
  userSchema,
  User,
};
