const express = require("express");

const adminRoutes = require("./admin.route");

const app = express();

app.use("/api/v1/admin", adminRoutes);

module.exports = app;
