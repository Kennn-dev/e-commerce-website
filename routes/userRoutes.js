const userController = require("../controllers/userController");
const express = require("express");
const router = express.Router();
const { jwtAuth } = require("../middlewares/auth");

//GET
router.get("/", userController.getAll);
router.get("/me", jwtAuth, userController.getMe);
//POST
router.post("/register", userController.register);
router.post("/login", userController.login);

//update
router.put("/me", jwtAuth, userController.updateMe);
module.exports = router;
