const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const shipperController = require('../app/controllers/shipperController');

router.get('/', auth.verifyToken, auth.checkRole('shipper'), shipperController.getShipperInfor);


module.exports = router;