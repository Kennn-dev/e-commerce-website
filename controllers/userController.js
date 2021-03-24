const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const passport = require("passport");

const { User } = require("../models/user");
const { readvSync } = require("fs");

exports.registerWithFacebook = function registerWithFacebook(req, res) {
  console.log(req.body);
  res.send(`Your username is ${req.body.username} :D`);
};

const existInfoError = (info, res) => {
  res.status(400);
  res.send({
    error: `${info} has exist !`,
  });
};
exports.register = function register(req, res) {
  const { username, email, password } = req.body;
  try {
    User.findOne({ username }, (err, user) => {
      if (user) {
        return existInfoError("username", res);
      } else {
        User.findOne({ email }, (err, user) => {
          if (user) {
            return existInfoError("Email", res);
          } else {
            const newData = {
              username,
              email,
              password,
            };

            //hash password
            bcrypt.genSalt(10, (err, salt) => {
              bcrypt.hash(password, salt, (err, hash) => {
                newData.password = hash;
              });
            });
            // console.log(newData);
            const newUser = new User(newData);
            newUser.save();
            res.send({
              success: " New user created ",
            });
          }
        });
      }
    });
  } catch (error) {
    console.log(error);
    res.send({ error });
  }
};
