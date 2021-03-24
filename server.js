// Responsible for connecting the MongoDB and starting the server.
require("dotenv").config();
const app = require("./app");
const consola = require("consola");
const mongoose = require("mongoose");

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
  });

app.listen(port, () => {
  consola.success(`Server started at port ${port} 🤖`);
});
