const express = require("express");
const cors = require("cors");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const db = require('./app/config/db/index');
dotenv.config();

db.connect();

app.use(cors());
app.use(cookieParser());
app.use(express.json());




//ROUTES

app.listen(8000, () => {
  console.log("Server is running");
});
