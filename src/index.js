const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const db = require('./app/config/db/index');

const app = express();
const routes = require('./routes/index');
dotenv.config();

//CONNECT TO DB
db.connect();

app.use(cors());
app.use(cookieParser());
app.use(express.json());

//ROUTES
app.use('/', routes);

//START SERVER
app.listen(process.env.PORT || 3306, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
