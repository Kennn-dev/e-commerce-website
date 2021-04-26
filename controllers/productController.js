require("dotenv").config();
const fs = require("fs");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { nGrams } = require("mongoose-fuzzy-searching/helpers");
const cloudinary = require("cloudinary").v2;

//
const { User } = require("../models/user");
const { Category } = require("../models/categories");
const { Product } = require("../models/product");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

//GET
exports.getAll = async function getAll(req, res) {
  try {
    let { limit, page } = req.query;
    // console.log(limit, page);

    // const result = await Product.find().limit(limit);
    await Product.paginate(
      {},
      {
        page: page !== undefined ? page : 1,
        limit: limit !== undefined ? limit : 100,
      },
      function (err, rs) {
        if (rs) res.send(rs.docs);
        if (err) {
          console.log(err);
          throw new Error(err);
        }
      }
    );
  } catch (error) {
    // console.log(error);
    res.send({ error });
  }
};
exports.getBySearchQuery = async function getBySearchQuery(req, res) {
  try {
    let { limit, page, search } = req.query;
    console.log(limit, page, search);

    // const result = await Product.fuzzySearch({
    //   query: search,
    //   prefixOnly: true,
    // });
    await Product.paginate(
      { $text: { $search: nGrams(search, false, 2, false).join(" ") } },
      { page: page ? page : 1, limit: limit ? limit : 100, sort: { date: -1 } },
      function (err, rs) {
        if (rs) {
          res.send(rs.docs);
        }
        if (err) {
          console.log(err);
          throw new Error(err);
        }
      }
    );
  } catch (error) {
    console.log(error);
    res.send({ error: error.message });
  }
};

//POST
exports.createNewProduct = async function createNewProduct(req, res) {
  try {
    //Authorization
    const decodedUser = await req.user;
    const user = await User.findById(decodedUser.userId).exec();
    // console.log(user);
    if (!user) throw Error("Cannot find User");
    // console.log(decodedUser);
    if (decodedUser) {
      //add file later
      const files = req.files;
      const imageArr = files.map((file) => {
        return file.path;
      });
      const arrImg = [];
      const { name, desc, categories, price, brand, available } = req.body;
      const category = await Category.findById(categories);
      if (!category) {
        throw Error("Cannot find Category");
      }
      const listUrl = await Promise.all(
        imageArr.map(async (item) => {
          // console.log(typeof item);
          return await cloudinary.uploader.upload(
            item,
            function (error, result) {
              if (error) {
                console.log({ error });
              }
              // console.log(result);
              arrImg.push(result.url);
              // return result;
            }
          );
        })
      );
      const product = new Product({
        name,
        desc,
        categories: category,
        price, //number
        brand,
        available,
        images: arrImg,
        seller: user,
      });
      // console.log(product);
      product.save().then((rs) => {
        if (rs === product)
          //  res.send(product);
          res.send({ success: `${product.name} was add by ${user.username}` });
      });
    }
  } catch (error) {
    console.log(error);
    res.send({ error });
  }
};
exports.editProduct = async function editProduct(req, res) {
  try {
    const decodedUser = await req.user;
    const user = await User.findById(decodedUser.userId).exec();
    // console.log(user);
    if (!user) throw Error("Cannot find User");
    res.send(user);
  } catch (err) {}
};
exports.deleteProduct = async function deleteProduct(req, res) {
  try {
    const id = await req.params.id;
    // console.log(id);
    if (!id) {
      res.send("ID Product is required 🔓");
    }
    await Product.findOneAndDelete({ _id: id }, (err, rs) => {
      if (err) {
        res.send({ error: err });
      } else {
        res.send({ success: "Delete success 🎉" });
      }
    });
  } catch (err) {
    if (err) res.send({ error: err });
  }
};
