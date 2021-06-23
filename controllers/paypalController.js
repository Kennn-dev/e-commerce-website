require("dotenv").config();
const paypal = require("@paypal/payouts-sdk");
const { testData } = require("./functions");
// Creating an environment
const clientId = process.env.PAYPAL_CLIENT_ID;
const clientSecret = process.env.PAYPAL_SECRET;
const environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
const client = new paypal.core.PayPalHttpClient(environment);

exports.test = function test(req, res) {
  res.send("ok");
};

exports.createRequest = async function createRequest(req, res) {
  try {
    console.log("ok", req.body.results);
    res.send({ success: "ok" });
  } catch (error) {
    console.log(error);
  }
};
