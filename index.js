const express = require("express");
const cors = require("cors");
const routes = require("./src/routes");
const cookieParser = require("cookie-parser");

require("dotenv").config();

process.env.PWD = process.cwd();

const app = express();

app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:5173", "https://dev-patient.tech42.in"],
  }),
);
app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(routes);

app.listen(process.env.PORT, () => {
  console.log("Connected to port ", process.env.PORT);
});
