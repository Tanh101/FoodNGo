const express = require('express');
const router = express.Router();
const mapController = require('../app/controllers/mapController');

router.get('/search', mapController.search);
router.get('/geocode', mapController.getGeoCode);
router.get('/address', mapController.getAddressByLocation)

module.exports = router;