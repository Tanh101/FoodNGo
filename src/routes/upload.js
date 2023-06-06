const express = require('express');
const multer = require('multer');
const router = express.Router();
const uploadController = require('../app/controllers/uploadController');

const upload = multer({ dest: '../upload' });


router.post('/',upload.single('image'), uploadController.uploadImage);


module.exports = router;