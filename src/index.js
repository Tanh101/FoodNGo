const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const db = require('./app/config/db/index');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

const authRouter = require("./routes/auth");
const userRouter = require("./routes/user");
const restaurantRouter = require("./routes/restaurant");

const app = express();

dotenv.config();

//CONNECT TO DB
db.connect();

app.use(cors());
app.use(cookieParser());
app.use(express.json());

//ROUTES
app.use('/api/auth', authRouter);

//user api
app.use('/api/user', userRouter);

//restaurant api
app.use('api/restaurant', restaurantRouter);


//START SERVER
app.listen(process.env.PORT || 3306, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
