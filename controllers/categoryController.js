require("dotenv").config();
const mongoose = require("mongoose");

const cloudinary = require("cloudinary").v2;
const { Category } = require("../models/categories");
// const { Image } = require("../models/image");

const { ObjectId } = mongoose.Types;
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

//GET
exports.getAll = async function getAll(req, res) {
  try {
    const result = await Category.find();
    if (!result) throw new Error("No data");
    res.send(result);
  } catch (error) {
    // console.log(error);
    res.send({ error });
  }
};

exports.getParentCategories = async function getParentCategories(req, res) {
  try {
    const result = await Category.find({ parent: null });

    res.send(result);
  } catch (error) {
    // console.log(error);
    res.send({ error });
  }
};
exports.getChildByParentID = async function getChildByParentID(req, res) {
  try {
    const { id } = req.params;
    const result = await Category.find({ parent: ObjectId(id) });
    if (!result) {
      throw new Error("Parent ID is invalid");
    }
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
    const { name, child, parent } = await req.body;

    const newCategory = {
      name,
      child: child ? new ObjectId(child) : null,
      parent: parent ? new ObjectId(parent) : null,
      image: null,
    };
    if (newCategory.parent) {
      await verifyParent(newCategory.parent);
    }
    if (newCategory.child) {
      await verifyChild(newCategory.child);
    }
    if (req.file) {
      await cloudinary.uploader.upload(req.file.path, (error, result) => {
        if (result) {
          newCategory.image = result.url;
        }
      });
    }
    // console.log(newCategory);

    const category = new Category(newCategory);
    category
      .save()
      .then((rs) => res.send({ success: "New category created 🎉" }));
  } catch (err) {
    res.send({ error: err.message });
  }
};
exports.deleteCategory = async function deleteCategory(req, res) {
  try {
    //validate admin here ...
    //then
    const { id } = req.params;
    // console.log(id);
    const rs = await Category.findByIdAndDelete(id);
    if (rs) {
      res.send({ success: "Delete Success 🎉" });
    }
  } catch (err) {
    console.log(err);
    res.send({ error: err });
  }
};

const verifyParent = async (idParent) => {
  const catParent = await Category.findOne({ _id: idParent });
  if (!catParent) throw new Error("Cannot find Parent ID");
  //parent.child = 2nd id
  // console.log(catParent);
  // return catParent;
};
const verifyChild = async (idChild) => {
  const catChild = await Category.findOne({ _id: idChild });
  if (!idChild) throw new Error("Cannot find Child ID");
  //parent.parent = 2nd id
  // console.log(catChild);
  // return catChild;
};
