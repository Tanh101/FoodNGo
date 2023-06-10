const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const db = require('./app/config/db/index');
const moment = require('moment-timezone');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

const http = require('http');
const socketIO = require('socket.io');
const app = express();
const server = http.Server(app);

const authRouter = require("./routes/auth");
const userRouter = require("./routes/user");
const restaurantRouter = require("./routes/restaurant");
const dashboardRouter = require('./routes/dashboard');
const productRouter = require('./routes/product');
const mapRouter = require('./routes/map');
const cartRouter = require('./routes/shoppingCart');
const categoryRouter = require('./routes/category');
const checkoutRouter = require('./routes/checkout');
const orderRouter = require('./routes/order');
const uploadRouter = require('./routes/upload');
const restaurantDashboardRouter = require('./routes/restaurantDashboard');
const shipperRouter = require('./routes/shipper');


const defaultTimezone = 'Asia/Ho_Chi_Minh';
moment.tz.setDefault(defaultTimezone);

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
app.use('/api/restaurant', restaurantRouter);

//dashboard api
app.use('/api/dashboard', dashboardRouter);

//product api
app.use('/api/product', productRouter);

//map api
app.use('/api/map', mapRouter);

//shopping cart api
app.use('/api/cart', cartRouter);

//category api
app.use('/api/category', categoryRouter);

//checkout 
app.use('/api/checkout', checkoutRouter);

app.use('/api/orders', orderRouter);

app.use('/api/upload', uploadRouter);

app.use('/api/shipper', shipperRouter);

app.use('/api/restaurant-dashboard', restaurantDashboardRouter);
//START SERVER

server.listen(process.env.PORT || 3306, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
