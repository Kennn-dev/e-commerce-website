require("dotenv").config();
const mongoose = require("mongoose");
const paypal = require("@paypal/payouts-sdk");
const { payment, configure } = require("paypal-rest-sdk");
const { Order } = require("../models/order");
const axios = require("axios");
const { clientPaypal } = require("../utils/functions");
const { Product } = require("../models/product");
const { ItemCart } = require("../models/itemCart");
const { User } = require("../models/user");
const { handleFilterCart } = require("./functions");
const { ObjectId } = mongoose.Types;
let accessTokenPaypal;
configure({
  mode: "sandbox", //sandbox or live
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_SECRET,
});
//GET
exports.getAll = async function getAll(req, res) {
  try {
    const result = await Order.find({});
    res.send(result);
  } catch (error) {
    res.status(500);
    res.send({ error: error.message });
  }
};
exports.getOrderWithUserId = async function getOrderWithUserId(req, res) {
  try {
    const { userId } = req.user;
    // console.log(userId);
    const orders = await Order.find({ "userOrder._id": userId })
      .sort({ createdAt: -1 })
      .exec();
    console.log(orders);
    res.status(200);
    res.send(orders);
  } catch (error) {
    console.log(error);
    res.status(500);
    res.send({ error: error.message });
  }
};
exports.getAllItemCart = async function getAllItemCart(req, res) {
  try {
    const result = await ItemCart.find({});
    res.send(result);
  } catch (error) {
    console.log({ error });
    res.status(500);
    res.send({ error: error.message });
  }
};

//POST
exports.createOrder = async function createOrder(req, res) {
  try {
    const decodedUser = await req.user;
    const { userId } = decodedUser;
    const { phone, address, notice, checkoutPayment, cartItemsId } =
      await req.body;
    console.log({ cartItemsId });
    const user = await User.findById(userId);
    if (!user) throw new Error(`Cannot find user`);
    let totalAmount = 0;

    // const convertedArr = cartItemsId.map((i) => mongoose.Types.ObjectId(i));

    const itemsList = await ItemCart.find(
      {
        _id: { $in: [...cartItemsId] },
      },
      (err, docs) => {
        // *docs : Array<ItemCart>
        // console.log(docs);
        // productList = docs;
        docs.forEach(async (el) => {
          totalAmount += el.amount;
          const idProd = el.product._id.toString();
          console.log({ idProd });
          const editProd = await Product.findById(idProd);
          editProd.sold = editProd.sold + el.quantity;
          editProd.available = editProd.available - el.quantity;
          await editProd.save().then((rs) => console.log("Save"));
        });
        return docs;
      }
    );
    // console.log({ productList });
    if (itemsList <= 0) throw new Error("Your cart is empty");

    const newOrder = {
      userOrder: user,
      notice: notice ? notice : "",
      phone,
      address,
      checkoutPayment,
      totalAmount,
      orderTime: Date.now(),
      products: itemsList,
    };

    console.log({ newOrder });

    // *Save
    // TODOS : filter item currentCart ( ! delete )
    const filteredCart = await handleFilterCart(user.currentCart, cartItemsId);
    // console.log("FilteredCart", filteredCart);
    user.currentCart = filteredCart;
    await user.save();
    const order = new Order(newOrder);
    order.save().then((rs) => {
      console.log(rs);
      res.send({ success: "Your order created successful ��" });
    });
  } catch (err) {
    res.status(500);
    res.send({ error: err.message });
    console.log(err);
  }
};

exports.modifyItemBySeller = async function modifyItem(req, res) {
  try {
    const decodedUser = req.user;
    const user = await User.findById(decodedUser.userId);
    if (!user) throw new Error("Cannot find user ");
    const { id } = req.params;
    const { newStatus } = req.body;
    // *item ordered by User
    const itemCart = await ItemCart.findOneAndUpdate(
      {
        _id: id,
        "product.seller._id": decodedUser.userId,
      },
      {
        orderStatus: newStatus,
      }
    );

    if (!itemCart) throw new Error("Cannot find itemCart");

    res.status(200);
    res.send({ success: `Status was changed to ${newStatus} ` });
  } catch (error) {
    res.status(401);
    res.send({ error: error.message });
  }
};
