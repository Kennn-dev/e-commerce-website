// Responsible for connecting the MongoDB and starting the server.
require("dotenv").config();
const app = require("./app");
const consola = require("consola");
const mongoose = require("mongoose");
const { Product } = require("./models/product");

const port = process.env.PORT;
const dbUrl = process.env.DATABASE_URL;
//Connect the database

mongoose
  .connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true,
    useUnifiedTopology: true,
  })
  .then((connection) => {
    if (connection) consola.success("Database connected ✅");
    // ? Sync to algolia
    Product.SetAlgoliaSettings({
      searchableAttributes: ["name", "brand", "categories", "price"], //Sets the settings for this schema, see [Algolia's Index settings parameters](https://www.algolia.com/doc/api-client/javascript/settings#set-settings) for more info.
    });
    Product.SyncToAlgolia();
  });

app.listen(port, () => {
  consola.success(`Server started at port ${port} 🤖`);
});
