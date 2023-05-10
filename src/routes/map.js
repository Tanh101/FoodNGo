const express = require('express');
const router = express.Router();
const mapController = require('../app/controllers/mapController');

router.get('/search', mapController.search);
router.get('/geocode', mapController.getGeoCode);

module.exports = router;