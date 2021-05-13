const userController = require("../controllers/userController");
const express = require("express");
const router = express.Router();

//GET
router.get("/", userController.getAll);
//POST
router.post("/register", userController.register);
router.post("/login", userController.login);

//update

module.exports = router;
