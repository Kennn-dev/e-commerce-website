const passport = require("passport");
const router = require("express").Router();
router.get("/facebook", function (req, res) {
  passport.authenticate("facebook", { scrope: "email" });
});
router.get("/facebook/callback", function (req, res) {
  passport.authenticate("facebook", { failureRedirect: "/users/login" }),
    res.send("Login successful !!! 🔓");
});

module.exports = router;
