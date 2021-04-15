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
    fileSize: 25000000, //25Mb :D
  },
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|png|JPG|PNG|JPEG|jpeg)$/)) {
      cb(new Error("Wrong format file"));
    } else {
      cb(null, true);
    }
  },
});

//GET
router.get("/", productController.getAll);
//POST
router.post(
  "/new",
  jwtAuth,
  upload.array("images", 10),
  productController.createNewProduct,
  (err, req, res, next) => {
    console.log(err);
    res.send({ error: err.message });
  }
);

module.exports = router;
