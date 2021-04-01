require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");

const { User } = require("../models/user");
const { readvSync } = require("fs");

const isValidSignUp = async (username, email) => {
  const validUsername = await User.findOne({ username });
  if (validUsername) {
    throw new Error("Username has exist in database !");
  }

  const validEmail = await User.findOne({ email });
  if (validEmail) {
    throw new Error("Email has exist in database !");
  }

  return true;
};

exports.register = async function register(req, res) {
  const { username, email, password } = req.body;
  // console.log(req.body);
  try {
    const isValid = await isValidSignUp(username, email);
    if (isValid) {
      //  hash password
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, async (err, hash) => {
          const newUser = new User({ username, email, password });
          newUser.password = hash;
          await newUser.save();
          // console.log(newUser);
          res.send({
            success: " New user created ",
          });
        });
      });
    }
  } catch (error) {
    // console.log(error);
    // res.status(400);
    res.send({ error: error.message });
  }
};

const isValidLogin = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Email is not exist in our Database 🔓`");
  }

  //check password
  const hash = await user.password;
  const isValid = await bcrypt.compare(password, hash);
  // console.log({ isValid });
  return isValid;
};

exports.login = async function login(req, res) {
  const { email, password } = await req.body;
  try {
    const isValid = await isValidLogin(email, password);
    if (isValid) {
      //generate token

      const user = await User.findOne({ email });
      const accessToken = jwt.sign(
        {
          userId: user._id,
          username: user.username,
          email: user.email,
          address: user.address,
          phone: user.phone,
          image: user.userImage,
        },
        process.env.ACCESS_TOKEN,
        { expiresIn: "1d" }
      );
      const refreshToken = jwt.sign(
        {
          userId: user._id,
          username: user.username,
          email: user.email,
          address: user.address,
          phone: user.phone,
          image: user.userImage,
        },
        process.env.REFRESH_TOKEN,
        { expiresIn: "7d" }
      );
      // console.log(user);
      res.send({
        success: "Login success 🎉",
        accessToken,
        refreshToken,
      });
    } else {
      throw new Error("Login failed ! Check your email or password ");
    }
  } catch (error) {
    console.log(error);
    // res.status(400);
    res.send({ error: error.message });
  }
};
