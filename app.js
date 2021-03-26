// Configure everything that has to do with Express application.
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const xss = require("xss-clean");
const passport = require("passport");
const passportFacebook = require("passport-facebook");
const app = express();

const authMiddleWare = require("./middlewares/auth");
// Allow Cross-Origin requests
app.use(cors());

// Set security for HTTPs headers
app.use(helmet());

//Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//protect XSS
app.use(xss());

//auth middlewares

//passport
app.use(passport.initialize());
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((id, done) => {
  return done(null, id);
});
passport.use(
  new passportFacebook.Strategy(
    {
      clientID: process.env.FB_ID,
      clientSecret: process.env.FB_SECRET_ID,
      callbackURL: "http://localhost:4001/auth/facebook/callback",
      profileFields: ["email", "name"],
    },
    function (accessToken, refreshToken, profile, callback) {
      //, callback
      console.log(profile);
      return callback(null, profile);
    }
  )
);

// //Handle Error
// app.all("*", (req, res, next) => {
//   res.status(404).json({
//     status: "fail",
//     message: `Url : ${req.originalUrl} doesn't exist !!!`,
//   });
//   next();
// });

//routes
app.get(
  "/auth/facebook",
  passport.authenticate("facebook", { scope: "email" })
);
app.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", {
    successRedirect: "/users/login",
  })
);
app.use("/users", require("./routes/userRoutes"));
app.use(authMiddleWare.jwtAuth);
//test
app.use("/products", require("./routes/productRoutes"));

module.exports = app;
