const express = require('express');
const User = require('../app/models/User');
const shipperService = {
    findShipper: async (req, res) => {
        try {
            // Lấy vị trí từ query parameter
            const location = req.body.location;
            const coordinates = location.split(',').map(coord => parseFloat(coord));

            // Tìm kiếm các nhà hàng gần vị trí người dùng trong cơ sở dữ liệu
            const shippers = await Shipper.find({
                location: {
                    $near: {
                        $geometry: {
                            type: 'Point',
                            coordinates: coordinates
                        },
                        $maxDistance: 3000 // Bán kính tìm kiếm (đơn vị: mét)
                    }
                }
            });

            // Gửi danh sách các nhà hàng làm phản hồi của API
            return res.json(shippers);
        } catch (error) {
            return res.status(500).json({
                error: 'Failed to fetch shippers'
            });
        }
    },
    isExitShipper: async (req, res) => {
        try {
            const {phone} = req.body;
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
    
    createShipper: async (req, res) => {
        try {
            let {name, phone, avatar, location, address} = req.body;
        } catch (error) {
            
        }
    }
};

module.exports = shipperService;