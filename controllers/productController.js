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
const { ItemCart } = require("../models/itemCart");
const {
  checkHasExistInCart,
  checkItemHasExistInCart,
  handleProductExistInCart,
  handleItemExistInCart,
  rankSetting,
  index,
  categoriesToQuery,
} = require("./functions");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});
const objIdConvert = mongoose.Types.ObjectId;

//GET
exports.getAll = async function getAll(req, res) {
  try {
    let { limit, page } = req.query;
    // console.log(limit, page);

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
    // * sortBy = "asc" or "desc"
    // * category = [String],
    // * orderBy = "createAt-price-like"
    // * category = "thoi trang+laptop+..."

    let {
      limit,
      page,
      search,
      sortBy,
      orderBy,
      category,
      lowPrice,
      highPrice,
    } = req.query;

    const rule = {
      objectID: "one-for-all-rule",
      conditions: [],
      consequence: {},
      validity: [
        {
          from: Math.floor(Date.now() / 1000),
          until: Math.floor(Date.now() / 1000) + 10 * 24 * 60 * 60,
        },
      ],
    };

    await index.search(search).then(({ hits }) => {
      console.log(hits);
      res.send(hits);
    });
  } catch (error) {
    console.log(error);
    res.send({ error: error.message });
  }
};
exports.getBySellerId = async function getBySellerId(req, res) {
  try {
    const { userId } = await req.user;
    // console.log(userId, username);
    const { id } = await req.params;
    let { limit, page } = req.query;

    // console.log({ id, userId });
    if (userId !== id) res.send({ error: "Id request is not match 🔒" });
    await Product.paginate(
      { "seller._id": mongoose.Types.ObjectId(id) },
      {
        page: page !== undefined ? page : 1,
        limit: limit !== undefined ? limit : 100,
      },
      function (err, rs) {
        if (rs) {
          // console.log(rs.docs);
          res.send(rs.docs);
        }
        if (err) {
          console.log(err);
          throw new Error(err);
        }
      }
    );
  } catch (error) {
    // console.log(error);
    res.send({ error: error });
  }
};
exports.getByProductId = async function getByProductId(req, res) {
  try {
    const { id } = req.params;

    // console.log(limit, page);

    // const result = await Product.find().limit(limit);
    await Product.paginate(
      { _id: mongoose.Types.ObjectId(id) },
      {
        page: 1,
        limit: 100,
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
    console.log(error);
    res.send({ error });
  }
};
exports.getItemInCart = async function getItemInCart(req, res) {
  try {
    //TODOS : Must be IN CARTTTTTTTT
    const decodedUser = await req.user;
    // const { userId } = req.params;
    // const itemInCart = await ItemCart.find({ userId: decodedUser.userId });
    const user = await User.findById(decodedUser.userId);
    if (!user) throw new Error("Cannot find User");

    res.send(user.currentCart);
  } catch (error) {
    res.status(403);
    res.send({ error: error.message });
  }
};
//
exports.getItemBySellerId = async function getItemBySellerId(req, res) {
  try {
  } catch (error) {}
};

//POST
exports.uploadImage = async function uploadImage(req, res) {
  try {
    const { file } = await req;
    console.log(file);
    if (!file) throw new Error("Oops ! File is missing 📁");

    // uploads images to cloud - save url
    const url = await cloudinary.uploader.upload(
      file.path,
      function (error, result) {
        if (error) {
          console.log({ error });
          throw new Error(error);
        }
        console.log({ result });

        return result.url;
      }
    );
    res.status(200);
    res.send(url);
  } catch (error) {
    res.status(400);
    res.send({ error });
  }
};
exports.destroyImage = async function destroyImage(req, res) {
  try {
    // const { userId } = await req.user;
    // if (!userId) throw new Error("User ID required 🔒");
    const { id } = req.params; //public_id
    if (!id) throw new Error("Oops ! Missing id image 🔑");

    await cloudinary.uploader.destroy(id, function (error, result) {
      if (error) throw new Error(error);
      if (result === "ok") {
        console.log(result);
        res.status(200);
        res.send({ success: "Deleted" });
      }
    });
  } catch (error) {
    res.status(400);
    res.send({ error });
  }
};
exports.createNewProduct = async function createNewProduct(req, res) {
  try {
    //Authorization
    const decodedUser = await req.user;

    const user = await User.findById(decodedUser.userId).exec();
    // console.log(user);
    if (!user) {
      res.send({ error: "Cannot find User" });
    }
    // console.log(decodedUser);
    if (decodedUser) {
      const cateArr = [];
      // console.log(req.body);
      const { name, desc, categories, price, brand, available, images } =
        req.body;
      // add all categories parents & child if they had
      const category = await Category.findById(categories); //
      if (!category) {
        throw Error("Cannot find Category");
      }
      cateArr.push(category);
      if (category.parent) {
        const parent = await Category.findById(category.parent);
        cateArr.push(parent);
      }
      if (category.child) {
        const child = await Category.findById(category.child);
        cateArr.push(child);
      }
      const product = new Product({
        name,
        desc,
        categories: cateArr,
        price: Number(price),
        brand,
        available: Number(available),
        images, //list url image
        seller: user,
      });
      // console.log(product);
      product.save().then((rs) => {
        if (rs === product)
          //  res.send(product);
          Product.SyncToAlgolia();
        res.send({ success: `${product.name} was added 🎉` });
      });
    }
    // res.send({ ok: req.body });
  } catch (error) {
    // console.log(error);
    res.send({ error: error.message });
  }
};
exports.editProduct = async function editProduct(req, res) {
  try {
    //Authorization
    const decodedUser = await req.user;
    const user = await User.findById(decodedUser.userId).exec();
    // console.log(user);
    if (!user) {
      res.send({ error: "Cannot find User" });
    }
    // console.log(decodedUser);
    if (decodedUser) {
      const { id } = await req.params;
      if (!id) throw new Error("Product's id doesn't exist ! ⚠");
      // const files = req.files;

      const arrImg = [];
      const cateArr = [];

      // console.log(req.body);
      const { name, desc, categories, price, brand, available, images } =
        await req.body;
      // images.map((image) => console.log(image));
      // cast categories to Object ID : mongoose.Types.ObjectID(categories)

      // add all categories parents & child if they had
      const category = await Category.findById(categories);
      if (!category) {
        throw Error("Cannot find Category");
      }
      cateArr.push(category);
      if (category.parent) {
        const parent = await Category.findById(category.parent);
        cateArr.push(parent);
      }
      if (category.child) {
        const child = await Category.findById(category.child);
        cateArr.push(child);
      }

      const editProduct = {
        name,
        desc,
        categories: cateArr,
        price: Number(price),
        brand,
        available: Number(available),
        images,
        seller: user,
      };
      // console.log({ newProduct });
      // res.send("ok");
      await Product.findByIdAndUpdate(id, editProduct, (err, docs) => {
        if (err) throw new Error(err);

        res.status(200);
        Product.SyncToAlgolia();
        res.send({ success: "Update success 🎉" });
      });
    }
    // res.send({ ok: req.body });
  } catch (error) {
    console.log(error);
    res.send({ error: error.message });
  }
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
        Product.SyncToAlgolia();
        res.send({ success: "Delete success 🎉" });
      }
    });
  } catch (err) {
    if (err) res.send({ error: err });
  }
};
exports.addToCart = async function addToCart(req, res) {
  try {
    const decodedUser = req.user;
    let { quantity } = await req.body;
    if (!quantity) {
      quantity = 1;
    }
    const user = await User.findById(decodedUser.userId);
    // console.log(decodedUser.userId);
    const idProd = await req.params.id; //id product here
    // console.log(req.params);
    if (!user) throw new Error("Cannot find User ��");
    // console.log(user);
    const productAdd = await Product.findById(idProd);
    if (!productAdd) throw new Error("Cannot find Product ⚠");
    // ?Check  item has exist in user cart ?
    // let currentCart = user.currentCart;
    // console.log(currentCart);
    const isExist = await checkHasExistInCart(idProd, user.currentCart);
    if (isExist) {
      // !update item was exist in cart
      const newCurrentCart = await handleProductExistInCart(
        idProd,
        user.currentCart,
        quantity,
        productAdd.price
      );
      user.currentCart = newCurrentCart;
      await user.save().then((rs) => {
        res.send({ success: "Item  cart update" });
      });
    } else {
      // !create new item with amount
      // *new item => push

      const newItem = new ItemCart({
        userId: user._id,
        product: productAdd,
        quantity: Number(quantity),
        amount: Number(productAdd.price) * Number(quantity),
      });
      await user.currentCart.push(newItem);
      await newItem.save();
      await user.save().then((rs) => {
        // console.log("Result ", rs);
        res.send({ success: "New item created" });
      });
    }
  } catch (error) {
    console.log(error);
    res.status(403);
    res.send({ error: error.message });
  }
};
exports.removeFromCart = async function removeFromCart(req, res) {
  try {
    const decodedUser = req.user;
    const user = await User.findById(decodedUser.userId);
    // console.log(decodedUser.userId);
    const { id } = await req.params; //id cartItem here
    console.log({ id });
    if (!user) throw new Error("Cannot find User ��");
    // TODOS: filter currentCart
    const cloneCart = [...user.currentCart];
    const newCart = cloneCart.filter((i) => i._id.toString() != id);
    //TODOS : delete ItemCart
    // * Save new currentCart data
    user.currentCart = newCart;
    await user.save().then((rs) => {
      // console.log({ rs });
      res.status(200);
      res.send({ success: `Delete success ✅` });
    });
  } catch (error) {
    console.log(error);
    res.status(403);
    res.send({ error: error.message });
  }
};
exports.editQuantity = async function editQuantity(req, res) {
  try {
    const decodedUser = req.user;
    let { quantity } = await req.body;
    if (!quantity) {
      throw new Error(`Missing quantity value ��`);
    }
    const user = await User.findById(decodedUser.userId);
    // console.log(decodedUser.userId);
    // * get id cartItem via params
    const { id } = await req.params;
    if (!user) throw new Error("Cannot find User ��");
    //itemCart find userId ?  && product._id = id
    const isExist = await checkItemHasExistInCart(id, user.currentCart);
    if (!isExist) throw new Error(`Item not exist in your cart ��`);
    // !update item was exist in cart
    const newCurrentCart = await handleItemExistInCart(
      id,
      user.currentCart,
      quantity
    );
    user.currentCart = newCurrentCart;
    // console.log({newCurrentCart})
    // console.log(user)
    await user.save().then((rs) => {
      // console.log("Result", rs);
      res.send({ success: "Item cart was update ✅" });
    });
  } catch (error) {
    res.status(403);
    console.log(error);
    res.send({ error: error.message });
  }
};
