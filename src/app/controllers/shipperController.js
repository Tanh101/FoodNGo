const express = require('express');
const Shipper = require('../models/Shipper');
const Account = require('../models/Account');
const Order = require('../models/Order');
const mongoose = require('mongoose');
const shipperController = {
    getShipperInfor: async (req, res) => {
        try {
            const account = await Account.findOne({ email: req.user.email }).select('-password');
            const shipper = await Shipper.findById(req.user.userId);
            const shipperWithAccount = {
                email: account.email,
                role: account.role,
                name: shipper.name,
                phone: shipper.phone,
                gender: shipper.gender,
                idNumber: shipper.idNumber,
                location: shipper.location,
                address: shipper.address,
                rete: shipper.rate,
                address: shipper.address,
                avatar: shipper.avatar,
                status: shipper.status,
                createdAt: shipper.createdAt,
                updatedAt: shipper.updatedAt
            }
            return res.status(200).json({
                sucess: true,
                message: 'Get shipper infor successfully',
                shipper: shipperWithAccount
            });
        } catch (error) {
            console.log(error.message);
            res.status(500).send('Server error');
        }
    },

    updateShipperInfor: async (req, res) => {
        try {
            const id = req.user.userId;
            const shipper = await Shipper.findById(id);
            if (!shipper) {
                return res.status(404).json({
                    sucess: false,
                    message: 'Shipper not found'
                });
            }
        } catch (error) {
            return res.status(500).json({
                sucess: false,
                message: 'Server error'
            });

        }
    },

    getRevenue: async (req, res) => {
        try {
            const shipperId = req.user.userId;
            const year = req.query.year || 2023;
            const totalRevenue = await Order.aggregate([
                {
                    $match: {
                        status: 'delivered',
                        shipper: mongoose.Types.ObjectId(shipperId),
                        createdAt: {
                            $gte: new Date(year, 0, 1), // Bắt đầu từ ngày đầu tiên của năm
                            $lte: new Date(year, 11, 31) // Kết thúc vào ngày cuối cùng của năm
                        }
                    }
                },
                {
                    $group: {
                        _id: { $month: '$createdAt' },
                        totalRevenue: { $sum: '$deliveryFee' }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        month: '$_id',
                        totalRevenue: 1
                    }
                },
                {
                    $sort: {
                        month: 1
                    }
                }
            ]);
            return res.status(200).json({
                sucess: true,
                message: 'Get revenue successfully',
                totalRevenue: totalRevenue
            });

        } catch (error) {
            return res.status(500).json({
                sucess: false,
                error: error.message
            });
        }
    }


}

module.exports = shipperController;