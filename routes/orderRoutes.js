const express = require("express");
const {
  getOrderWithSellerId,
  createOrder,
  getOrderWithUserId,
  getAll,
  getAllItemCart,
} = require("../controllers/orderController");
const { jwtAuth } = require("../middlewares/auth");
const router = express.Router();

//GET
//Get all orders with seller id
router.get("/", getAll);
//Get all itemcart
router.get("/items", getAllItemCart);
//Get all orders with user id
router.get("/me", jwtAuth, getOrderWithUserId);
//POST
router.post("/create", jwtAuth, createOrder);

//update

module.exports = router;
