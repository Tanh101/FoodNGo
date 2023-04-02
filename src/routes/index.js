const { Router } = require("express");
const authRouter = require("./auth");
const routes = Router();

routes.use('/auth', authRouter);

module.exports = routes;
