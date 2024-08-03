const express = require("express");

const adminRoutes = require("./admin.route");
const userRoutes = require("./user.route");
const commonRoutes = require("./common.route");

const app = express();

app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/common", commonRoutes);

module.exports = app;
