require("dotenv").config();
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const { Category } = require("../models/categories");
// const { Image } = require("../models/image");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

//GET
exports.getAll = async function getAll(req, res) {
  try {
    const result = await Category.find();
    res.send(result);
  } catch (error) {
    // console.log(error);
    res.send({ error });
  }
};

//POST
exports.createCategory = async function createCategory(req, res) {
  try {
    //validate admin here ...
    //then
    const { name, child } = await req.body;
    let arr = [];
    arr.push(child);
    const newCategory = {
      name,
      child: arr,
    };
    await cloudinary.uploader.upload(req.file.path, (error, result) => {
      if (result) {
        newCategory.image = result.url;
      }
    });
    // console.log(newCategory);
    const category = new Category(newCategory);
    category
      .save()
      .then((rs) => res.send({ success: "New category created 🎉" }));
  } catch (err) {
    res.send({ error: err });
  }
};
exports.deleteCategory = async function deleteCategory(req, res) {
  try {
    //validate admin here ...
    //then
    const { id } = req.params;
    console.log(id);
    const rs = await Category.findByIdAndDelete(id);
    if (rs) {
      res.send({ success: "Delete Success 🎉" });
    }
  } catch (err) {
    console.log(err);
    res.send({ error: err });
  }
};
