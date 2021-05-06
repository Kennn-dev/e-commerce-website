const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
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
    if (!file.originalname.match(/\.(jpg|png|JPG|PNG|JPEG|jpeg|svg)$/)) {
      cb(new Error("Wrong format file"));
    } else {
      cb(null, true);
    }
  },
});

//GET
router.get("/", categoryController.getAll);
router.get("/parent/", categoryController.getParentCategories);
router.get("/child/:id", categoryController.getChildByParentID);
//post
router.post("/new", upload.single("image"), categoryController.createCategory);
router.post("/delete/:id", categoryController.deleteCategory); ///Token jwt here
module.exports = router;
