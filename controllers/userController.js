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

exports.getAll = async function getAll(req, res) {
  try {
    //validate admin
    const user = await User.find();
    res.send(user);
  } catch (error) {
    res.send({ error });
  }
};

exports.getMe = async function getMe(req, res) {
  try {
    const decodedUser = await req.user;
    const user = await User.findById(decodedUser.userId);
    if (!user) throw new Error(`Cannot find User`);
    // console.log(user);
    res.status(200);
    res.send(user);
  } catch (error) {
    console.log(error);
    res.status(500);
    res.send({ error: error.message });
  }
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
          address: user.address || "",
          phone: user.phone || "",
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
        user,
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

exports.updateMe = async function updateMe(req, res) {
  try {
    const decodedUser = await req.user;
    const {
      email,
      username,
      userImage,
      password,
      oldPassword,
      phone,
      address,
    } = req.body;
    const user = await User.findById(decodedUser.userId);
    if (!user) throw new Error(`Cannot find User`);

    user.username = username ? username : user.username;
    user.userImage = userImage ? userImage : user.userImage;
    user.email = email ? email : user.email;
    user.phone = phone ? phone : user.phone;
    user.address = address ? address : user.address;
    if (!password || !oldPassword) {
      await user.save();
      res.status(200);
      res.send({ success: `Update success ��` });
    }
    const isExact = bcrypt.compareSync(oldPassword, user.password); // true
    if (!isExact) throw new Error(`Old Password invalid ��`);
    const salt = bcrypt.genSaltSync(10);
    const hashPassword = bcrypt.hashSync(password, salt);
    user.password = hashPassword ? hashPassword : user.password;
    await user.save();
    // console.log(user)
    res.status(200);
    res.send({ success: `Update success ��` });
  } catch (error) {
    console.log(error);
    res.status(500);
    res.send({ error: error.message });
  }
};
