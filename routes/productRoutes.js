const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { jwtAuth } = require("../middlewares/auth");

const fs = require("fs");
const multer = require("multer");
const getStream = require("get-stream");
const upload = multer({
  dest: "D:/Đồ án tổng hợp/server/upload/product",
  limits: {
    fileSize: 10000000, //10Mb :D
  },
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|png|JPG|PNG|JPEG|jpeg|svg|jfif)$/)) {
      cb(new Error("Wrong format file"));
    } else {
      cb(null, true);
    }
  },
});

//GET
router.get("/", productController.getAll, (err, req, res) => {
  console.log(err);
  res.send({ error: err.message });
});

router.get("/single/:id", productController.getByProductId, (err, req, res) => {
  console.log(err);
  res.send({ error: err.message });
});
router.get(
  "/search",
  productController.getBySearchQuery,
  (err, req, res, next) => {
    console.log(err);
    res.send({ error: err.message });
  }
);
router.get("/seller/:id", jwtAuth, productController.getBySellerId);

//POST
//handle images with different endpoints
//response id img to client when they send file uploads
router.post(
  "/image/upload",
  upload.single("images", 10),
  productController.uploadImage,
  (req, res, next) => {
    console.log(err);
    res.send({ error: err.message });
  }
);
router.post("/image/destroy/:id", productController.destroyImage);
router.post("/new", jwtAuth, productController.createNewProduct);
router.post("/edit/:id", jwtAuth, productController.editProduct);
router.post("/delete/:id", jwtAuth, productController.deleteProduct);
module.exports = router;
