const express = require("express");
const router = express.Router();

const data = {
  name: "Unknow product",
  price: 9999999,
};

router.get("/", async (req, res, next) => {
  res.send({ data });
});

module.exports = router;
