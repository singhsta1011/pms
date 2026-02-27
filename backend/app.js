const express = require("express");
const app = express();

app.use(express.json());

app.use("/api/auth", require("./src/routes/auth.routes"));
app.use("/uploads", require("express").static("src/uploads"));


module.exports = app;