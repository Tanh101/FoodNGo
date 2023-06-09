const express = require('express');
const Shipper = require('../models/Shipper');

const shipperController = {
    getShipperInfor: async (req, res) => {
        try {
            const shipper = await Shipper.findById(req.user.id).select('-password');
            res.json(shipper);
        } catch (error) {
            console.log(error.message);
            res.status(500).send('Server error');
        }
    }
}

module.exports = shipperController;