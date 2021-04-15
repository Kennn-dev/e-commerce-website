require("dotenv").config();
const fs = require("fs");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary").v2;

//
const { User } = require("../models/user");
// const { Image } = require("../models/image");
const { Product } = require("../models/product");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

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
        return file.path;
        // const img = fs.readFileSync(file.path);
        // return img.toString("base64");
        // const newFile = {
        //   name: file.originalname,
        //   contentType: file.mimetype,
        //   base64: encodeImg,
        // };
        // return new Image(newFile);
      });
      const { name, desc, categories, price, brand, available } = req.body;
      const listUrl = await Promise.all(
        imageArr.map(async (item) => {
          // console.log(typeof item);
          return await cloudinary.uploader.upload(
            item,
            function (error, result) {
              if (error) {
                console.log({ error });
              }
              console.log(result);
              return result;
            }
          );
        })
      );
      console.log(listUrl);
      res.send(listUrl);
      // const product = new Product({
      //   name,
      //   desc,
      //   categories,
      //   price, //number
      //   brand,
      //   available,
      //   images: imageArr,
      //   seller: user,
      // });
      // console.log(product);
      // product.save().then((rs) => {
      //   if (rs === product)
      //     //  res.send(product);
      //     res.send({ success: `${product.name} was add by ${user.username}` });
      // });
    }
  } catch (error) {
    console.log(error);
    res.send({ error });
  }
};
