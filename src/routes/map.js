const express = require('express');
const router = express.Router();
const mapController = require('../app/controllers/mapController');
const auth = require('../middleware/auth');
router.get('/search', mapController.search);
router.get('/geocode', mapController.getGeoCode);
router.get('/address', mapController.getAddressByLocation)
router.get('/distance', auth.verifyToken, mapController.getDistance);
module.exports = router;