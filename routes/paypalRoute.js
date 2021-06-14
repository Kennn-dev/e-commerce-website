const express = require("express");
const { test, createRequest } = require("../controllers/paypalController");
const { jwtAuth } = require("../middlewares/auth");
const router = express.Router();

//GET
router.get("/test", test);
//POST
router.post("/complete", createRequest);
//update

module.exports = router;
