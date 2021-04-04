require("dotenv").config();
const fs = require("fs");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { User } = require("../models/user");
const { Image } = require("../models/image");
const { Product } = require("../models/product");

//GET
exports.getAll = async function getAll(req, res) {
  try {
    const result = await Product.find();
    res.send({ data: result });
  } catch (error) {
    // console.log(error);
    res.send({ error });
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
        const img = fs.readFileSync(file.path);
        const encodeImg = img.toString("base64");
        // return Buffer.from(encodeImg, "base64");
        const newFile = {
          name: file.originalname,
          contentType: file.mimetype,
          base64: encodeImg,
        };

        return new Image(newFile);
      });

      // res.send({ file: req.file, buffer: encodeImg });
      // res.send()
      const { name, desc, categories, price, brand, available } = req.body;
      const product = new Product({
        name,
        desc,
        categories,
        price, //number
        brand,
        available,
        images: imageArr,
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
