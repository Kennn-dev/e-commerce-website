require("dotenv").config();
const paypal = require("@paypal/payouts-sdk");

const clientId = process.env.PAYPAL_CLIENT_ID;
const clientSecret = process.env.PAYPAL_SECRET;
const enviroment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
const clientPaypal = new paypal.core.PayPalHttpClient(enviroment);

module.exports = {
  clientPaypal,
};
