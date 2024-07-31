const express = require("express");
const cors = require("cors");
const routes = require("./src/routes");
const cookieParser = require("cookie-parser");

require("dotenv").config();

process.env.PWD = process.cwd();

const app = express();

app.use(cors());
app.options("*", cors({ credentials: true }));
app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(routes);

app.listen(process.env.PORT, () => {
  console.log("Connected to port ", process.env.PORT);
});
