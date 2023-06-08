const express = require('express');
const User = require('../app/models/User');
const Shipper = require('../app/models/Shipper');
const shipperService = {
    findShipper: async (req, res) => {
        try {
            const location = req.body.location;
            const coordinates = location.split(',').map(coord => parseFloat(coord));

            const shippers = await Shipper.find({
                location: {
                    $near: {
                        $geometry: {
                            type: 'Point',
                            coordinates: coordinates
                        },
                        $maxDistance: 3000
                    }
                }
            });
            return res.json(shippers);
        } catch (error) {
            return res.status(500).json({
                error: 'Failed to fetch shippers'
            });
        }
    },
    isExitShipper: async (req, res) => {
        try {
            const { phone } = req.body;
            const shipper = await User.find({
                phone: phone
            })
            if (shipper) {
                return res.status(400).json({
                    success: false,
                    message: 'Phone number already exists'
                });
            }
        } catch (error) {
            return res.status(500).json({
                error: 'Failed to fetch shippers'
            });
        }
    },

    createShipper: async (req, res, account_id) => {
        try {
            let { name, phone, gender, avatar, idNumber,
                location, address } = req.body;
            if (name && phone && gender && avatar
                && idNumber && location && address) {
                let newShipper = new Shipper({
                    name: name,
                    phone: phone,
                    gender: gender,
                    avatar: avatar,
                    idNumber: idNumber,
                    location: location,
                    address: address,
                    account: account_id
                });
                await newShipper.save();
                return newShipper;
            } else {
                return null;
            }
        } catch (error) {
            return null;

        }
    }
};

module.exports = shipperService;