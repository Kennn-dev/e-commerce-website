require("dotenv").config();
const fs = require("fs");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { nGrams } = require("mongoose-fuzzy-searching/helpers");
const cloudinary = require("cloudinary").v2;
const { ObjectId } = mongoose.Types;
//
const { User } = require("../models/user");
const { Category } = require("../models/categories");
const { Product } = require("../models/product");
const { ItemCart } = require("../models/itemCart");
const { Rating } = require("../models/rating");
const {
  checkHasExistInCart,
  checkItemHasExistInCart,
  handleProductExistInCart,
  handleItemExistInCart,
  rankSetting,
  index,
  categoriesToQuery,
} = require("./functions");
const { Order } = require("../models/order");
const { Comment } = require("../models/comment");

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
    console.log(error);
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
exports.getItemBySellerId = async function getItemBySellerId(req, res) {
  try {
    try {
      // const userToken = await req.user;
      // const userId = userToken.userId;
      // console.log(userId, username);
      const { id } = await req.params;
      // let { limit, page } = req.query;

      console.log({ id, obj: ObjectId(id) });
      // if (userId !== id) res.send({ error: "Id request is not match 🔒" });
      const data = await Order.find({
        "products.product.seller._id": ObjectId(id),
      }).sort({ createdAt: -1 });
      // const prodArr = data.forin((i) =>
      //   i.products.filter((prod) => prod.product.seller._id.toString() == id)
      // );
      const result = data.reduce((rs, i) => {
        const prodArr = i.products.filter(
          (prod) => prod.product.seller._id.toString() == id
        );
        const item = {
          user: i.userOrder,
          products: prodArr,
        };
        rs.push(item);
        return rs;
      }, []);
      res.status(200);
      res.send(result);
    } catch (error) {
      console.log(error);
      res.send({ error });
    }
  } catch (error) {}
};
exports.getComment = async function getComment(req, res) {
  try {
    // ??id product
    const { id } = await req.params;
    if (!id) throw new Error(`Missing id product value 😢`);
    const cmts = await Comment.find({ productId: id });
    res.status(200);
    res.send(cmts);
  } catch (error) {
    console.log(error);
    res.status(200);
    res.send({ error: error.message });
  }
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
exports.createComment = async function createComment(req, res) {
  try {
    const { id } = await req.params;
    const { userId } = await req.user;
    const { content, media } = await req.body;
    console.log(content);
    if (!content) throw new Error(`Content cannot blank`);
    if (!id) throw new Error(`Id product not found ⚠️`);
    const user = await User.findById(userId);
    const newCmt = {
      productId: id,
      user,
      content,
      media: media || [],
    };
    const cmt = new Comment(newCmt);
    cmt.save().then((rs) => {
      if (rs) {
        res.status(200);
        res.send({ success: `Created success 😃` });
      }
    });
  } catch (error) {
    res.status(500);
    console.log(error);
    res.send({ error: error.message });
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
      const {
        name,
        desc,
        categories,
        price,
        brand,
        available,
        images,
        like,
        rating,
      } = await req.body;
      // images.map((image) => console.log(image));
      // cast categories to Object ID : mongoose.Types.ObjectID(categories)

      // add all categories parents & child if they had
      if (like) {
        const productWithOldLike = await Product.findById(id);
        productWithOldLike.like += 1;
        await productWithOldLike.save();
        res.status(200);
        res.send({ success: `U was like this product 😍 ` });
        Product.SyncToAlgolia();
      }
      if (rating) {
        const productInDB = await Product.findById(id);
        const allRate = await productInDB.rating;
        // TODOS : calc rating here
        // * ((Overall Rating * Total Rating) + new Rating) / (Total Rating + 1)
        let newRating = (allRate * rating + rating) / (allRate + 1);
        // TODOS : Phan rating thanh 5 ti le khac nhau moi'' tinh' dc :cry:
        productInDB.rating = newRating;
        await productInDB
          .save()
          .then(() => res.send({ success: `U was rate this product 😄` }));
      }

      if (!like && !rating) {
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
exports.editRating = async function editRating(req, res) {
  try {
    const decodedUser = req.user;
    let { rateScore } = await req.body;
    if (!rateScore) {
      throw new Error(`Missing quantity value ��`);
    }
    const user = await User.findById(decodedUser.userId);
    // * get id product via params
    const { id } = await req.params;
    if (!user) throw new Error("Cannot find User ��");
    const product = await Product.findById(id);
    if (!product) throw new Error("Cannot find product 😢");
    // ?create that document with product id and user id
    const rating = await Rating.find({
      userId: decodedUser.userId,
      productId: id,
    });
    console.log({ rating });
    if (rating.length <= 0) {
      const newRating = new Rating({
        userId: decodedUser.userId,
        productId: id,
      });
      newRating.save();
      const count = await Rating.find({}).count();
      if (count == 0) {
        //*No rating for this product
        product.rating = rateScore;
        await product.save().then((doc) => {
          if (doc) {
            Product.SyncToAlgolia();
            res.status(200);
            res.send({ success: `Total rating : ${doc.rating}` });
          }
        });
      } else {
        product.rating = (product.rating + rateScore) / count;
        await product.save().then((doc) => {
          if (doc) {
            Product.SyncToAlgolia();
            res.status(200);
            res.send({ success: `Total rating : ${doc.rating}` });
          }
        });
      }
    } else {
      res.status(200);
      res.send("You was rate this product");
    }
  } catch (error) {
    res.status(403);
    console.log(error);
    res.send({ error: error.message });
  }
};
exports.editStatusItem = async function editStatusItem(req, res) {
  try {
    const decodedUser = req.user;
    let newStatus = await req.body.status;
    if (!newStatus) {
      throw new Error(`Missing input value ��`);
    }
    const user = await User.findById(decodedUser.userId);
    // * get id product via params
    const { id } = await req.params;
    if (!user) throw new Error("Cannot find User ��");
    Item.findByIdAndUpdate(id, {
      status: newStatus,
    }).then((rs) => {
      res.status(200);
      res.send({ success: "New status updated 🙂" });
    });
  } catch (error) {
    console.log(error);
    res.status(500);
    res.send({ error });
  }
};
// noice
