const express = require("express");
const cors = require("cors");
const routes = require("./src/routes");

require("dotenv").config();

process.env.PWD = process.cwd();

const app = express();

// enable cors
app.use(cors());
app.options("*", cors());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(routes);

app.listen(process.env.PORT, () => {
  console.log("Connected to port ", process.env.PORT);
});
