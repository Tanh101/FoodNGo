const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const db = require('./app/config/db/index');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

const app = express();
dotenv.config();
const authRouter = require("./routes/auth");
//CONNECT TO DB
db.connect();

app.use(cors());
app.use(cookieParser());
app.use(express.json());

//ROUTES
app.use('/auth', authRouter);

// const options = {
//   definition: {
//     openapi: '3.0.0',
//     info: {
//       title: 'API Documentation',
//       version: '1.0.0',
//       description: 'API Documentation',
//     },
//     servers: [
//       {
//         url: 'http://localhost:3001',
//       },
//     ],
//   },
//   apis: ['./routes/*.js'],
// };

// const specs = swaggerJsDoc(options);
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

//START SERVER
app.listen(process.env.PORT || 3306, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
