const express = require('express');
const Shipper = require('../models/Shipper');
const Account = require('../models/Account');

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
    }
}

module.exports = shipperController;