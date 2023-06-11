const express = require('express');
const Restaurant = require('../models/Restaurant');
const User = require('../models/User');
const Account = require('../models/Account');
const Category = require('../models/Category');
const Shipper = require('../models/Shipper');
const Order = require('../models/Order');



const dashboardController = {
    getAllRestaurants: async (req, res) => {
        let restaurants = null;
        let { status } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        let totalResult = 0;
        try {
            if (status) {
                totalResult = await Restaurant.aggregate([
                    {
                        $lookup: {
                            from: 'accounts',
                            localField: 'account',
                            foreignField: '_id',
                            as: 'account'
                        }
                    },
                    {
                        $unwind: '$account'
                    },
                    {
                        $match: { 'account.status': status }
                    }
                ]).exec();
                restaurants = await Restaurant.aggregate([
                    {
                        $lookup: {
                            from: 'accounts',
                            localField: 'account',
                            foreignField: '_id',
                            as: 'account'
                        }
                    },
                    {
                        $unwind: '$account'
                    },
                    {
                        $match: { 'account.status': status }
                    },
                    {
                        $skip: (page - 1) * limit
                    },
                    {
                        $limit: limit
                    }
                ]).exec();
            }
            else {
                totalResult = await Restaurant.aggregate([
                    {
                        $lookup: {
                            from: 'accounts',
                            localField: 'account',
                            foreignField: '_id',
                            as: 'account'
                        }
                    },
                    {
                        $unwind: '$account'
                    }
                ]).exec();

                restaurants = await Restaurant.aggregate([
                    {
                        $lookup: {
                            from: 'accounts',
                            localField: 'account',
                            foreignField: '_id',
                            as: 'account'
                        }
                    },
                    {
                        $unwind: '$account'
                    },
                    {
                        $skip: (page - 1) * limit
                    },
                    {
                        $limit: limit
                    }
                ]).exec();
            }
            totalResult = totalResult.length;
            const totalPage = Math.ceil(totalResult / limit);
            const pagination = {
                totalResult,
                totalPage,
                currentPage: page,
            }
            const response = restaurants.map(restaurant => {
                return {
                    restaurant,
                    account: restaurant.account,
                };
            }
            );
            return res.status(200).json({
                success: true,
                restaurants: response,
                pagination
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    getAllShipper: async (req, res) => {
        try {
            let { status } = req.query;
            let shippers = null;
            let totalResult = 0;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            if (status) {
                totalResult = await Shipper.aggregate([
                    {
                        $lookup: {
                            from: 'accounts',
                            localField: 'account',
                            foreignField: '_id',
                            as: 'account'
                        }
                    },
                    {
                        $unwind: '$account'
                    },
                    {
                        $match: { 'account.status': status }
                    },
                    {
                        $skip: (page - 1) * limit
                    },
                    {
                        $limit: limit
                    }
                ]).exec();

                shippers = await Shipper.aggregate([
                    {
                        $lookup: {
                            from: 'accounts',
                            localField: 'account',
                            foreignField: '_id',
                            as: 'account'
                        }
                    },
                    {
                        $unwind: '$account'
                    },
                    {
                        $match: { 'account.status': status }
                    }
                ]).exec();
            }
            else {
                totalResult = await Shipper.aggregate([
                    {
                        $lookup: {
                            from: 'accounts',
                            localField: 'account',
                            foreignField: '_id',
                            as: 'account'
                        }
                    },
                    {
                        $unwind: '$account'
                    }
                ]).exec();

                shippers = await Shipper.aggregate([
                    {
                        $lookup: {
                            from: 'accounts',
                            localField: 'account',
                            foreignField: '_id',
                            as: 'account'
                        }
                    },
                    {
                        $unwind: '$account'
                    },
                    {
                        $skip: (page - 1) * limit
                    },
                    {
                        $limit: limit
                    }
                ]).exec();
            }

            const response = shippers.map(shipper => {
                return {
                    shipper,
                    account: shipper.account
                };

            });

            totalResult = totalResult.length;
            const totalPage = Math.ceil(totalResult / limit);
            const pagination = {
                totalResult,
                totalPage,
                currentPage: page,
            }
            return res.status(200).json({
                success: true,
                shippers: response,
                pagination
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },
    getAllUsers: async (req, res) => {
        try {
            let { status } = req.query;
            let users = null;
            let totalResult = 0;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            if (status) {
                totalResult = await User.aggregate([
                    {
                        $lookup: {
                            from: 'accounts',
                            localField: 'account',
                            foreignField: '_id',
                            as: 'account'
                        }
                    },
                    {
                        $unwind: '$account'
                    },
                    {
                        $match: { 'account.status': status }
                    }
                ]).exec();
                users = await User.aggregate([
                    {
                        $lookup: {
                            from: 'accounts',
                            localField: 'account',
                            foreignField: '_id',
                            as: 'account'
                        }
                    },
                    {
                        $unwind: '$account'
                    },
                    {
                        $match: { 'account.status': status }
                    },
                    {
                        $skip: (page - 1) * limit
                    },
                    {
                        $limit: limit
                    }
                ]).exec();
            }
            else {
                totalResult = await User.aggregate([
                    {
                        $lookup: {
                            from: 'accounts',
                            localField: 'account',
                            foreignField: '_id',
                            as: 'account'
                        }
                    },
                    {
                        $unwind: '$account'
                    }
                ]).exec();
                users = await User.aggregate([
                    {
                        $lookup: {
                            from: 'accounts',
                            localField: 'account',
                            foreignField: '_id',
                            as: 'account'
                        }
                    },
                    {
                        $unwind: '$account'
                    }

                ]).exec();
            }
            totalResult = totalResult.length;
            const totalPage = Math.ceil(totalResult / limit);
            const pagination = {
                totalResult,
                totalPage,
                currentPage: page,
            }
            const response = users.map(user => {
                return {
                    user,
                    account: user.account,
                };
            });
            return res.status(200).json({
                success: true,
                users: response,
                pagination
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    approveRestaurant: async (req, res) => {
        try {
            const restaurant = await Restaurant.findById(req.params.id);
            if (!restaurant) {
                return res.status(404).json({
                    success: false,
                    message: 'Restaurant not found',
                });
            }
            const account = await Account.findById(restaurant.account);
            if (!account) {
                return res.status(404).json({
                    success: false,
                    message: 'Account not found',
                });
            }
            account.status = 'active';
            await account.save();

            restaurant.status = 'open';
            await restaurant.save();

            return res.status(200).json({
                success: true,
                message: 'Approve restaurant successfully',
                restaurant,
                account
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    approveShipper: async (req, res) => {
        try {
            const shipper = await Shipper.findById(req.params.id);
            if (!shipper) {
                return res.status(404).json({
                    success: false,
                    message: 'Shipper not found',
                });
            }
            const account = await Account.findById(shipper.account);
            if (!account) {
                return res.status(404).json({
                    success: false,
                    message: 'Account not found',
                });
            }

            account.status = 'active';
            await account.save();

            shipper.status = 'online';
            await shipper.save();
            const { password, ...accountWithoutPassword } = account._doc;
            return res.status(200).json({
                success: true,
                message: 'Approve shipper successfully',
                shipper,
                account: accountWithoutPassword
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },


    banUser: async (req, res) => {
        try {
            const role = req.query.role;
            let restaurant = null;
            let user = null;
            let account = null;
            let shipper = null;
            if (role === 'restaurant') {
                restaurant = await Restaurant.findById(req.params.id);
                if (!restaurant) {
                    return res.status(404).json({
                        success: false,
                        message: 'Restaurant not found',
                    });
                }
                account = await Account.findById(restaurant.account);
                if (!account) {
                    return res.status(404).json({
                        success: false,
                        message: 'Account not found',
                    });
                }
                account.status = 'deleted';
                await account.save();
                restaurant.status = 'deleted';
                await restaurant.save();
                const { password, ...accountWithoutPassword } = account._doc;
                return res.status(200).json({
                    success: true,
                    message: 'Ban restaurant successfully',
                    restaurant,
                    account: accountWithoutPassword
                });
            }
            else if (role === 'user') {
                user = await User.findById(req.params.id);
                if (!user) {
                    return res.status(404).json({
                        success: false,
                        message: 'User not found',
                    });
                }
                account = await Account.findById(user.account);
                if (!account) {
                    return res.status(404).json({
                        success: false,
                        message: 'Account not found',
                    });
                }
                account.status = 'deleted';
                await account.save();
                user.status = 'deleted';
                await user.save();
                const { password, ...accountWithoutPassword } = account._doc;
                return res.status(200).json({
                    success: true,
                    message: 'Ban user successfully',
                    user,
                    account: accountWithoutPassword
                });
            }
            else if (role === 'shipper') {
                shipper = await Shipper.findById(req.params.id);
                if (!shipper) {
                    return res.status(404).json({
                        success: false,
                        message: 'Shipper not found',
                    });
                }
                account = await Account.findById(shipper.account);
                if (!account) {
                    return res.status(404).json({
                        success: false,
                        message: 'Account not found',
                    });
                }
                account.status = 'deleted';
                await account.save();
                shipper.status = 'deleted';
                await shipper.save();
                const { password, ...accountWithoutPassword } = account._doc;
                return res.status(200).json({
                    success: true,
                    message: 'Ban shipper successfully',
                    shipper,
                    account: accountWithoutPassword
                });
            }
            else {
                return res.status(404).json({
                    success: false,
                    message: 'Role not found',
                });
            }
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    getRestaurantById: async (req, res) => {
        try {
            const restaurant = await Restaurant.findById(req.params.id);
            const account = await Account.findById(restaurant.account);
            const { password, ...accountWithoutPassword } = account._doc;
            if (restaurant) {
                return res.status(200).json({
                    success: true,
                    restaurant,
                    account: accountWithoutPassword
                });
            }
            return res.status(404).json({
                success: false,
                message: 'Restaurant not found'
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    getUserById: async (req, res) => {
        try {
            const user = await User.findById(req.params.id);
            const account = await Account.findById(user.account);
            const { password, ...accountWithoutPassword } = account._doc;
            if (user) {
                return res.status(200).json({
                    success: true,
                    user,
                    account: accountWithoutPassword
                });
            }
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    getShipperById: async (req, res) => {
        try {
            const shipper = await Shipper.findById(req.params.id);
            const account = await Account.findById(shipper.account);
            const { password, ...accountWithoutPassword } = account._doc;
            if (shipper) {
                return res.status(200).json({
                    success: true,
                    shipper,
                    account: accountWithoutPassword
                });
            }
            return res.status(404).json({
                success: false,
                message: 'Shipper not found'

            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    updateRestaurant: async (req, res) => {
        try {
            const { name, address, location, openingHours, categories, media, url, phone, description, rate, status } = req.body;
            const restaurant = await Restaurant.
                findByIdAndUpdate(req.user.userId, {
                    name,
                    address,
                    location,
                    openingHours,
                    categories,
                    media,
                    url,
                    phone,
                    description,
                    rate,
                    status
                }, { new: true });

            if (!restaurant) {
                return res.status(404).json({
                    success: false,
                    message: 'Restaurant not found',
                });
            }
            return res.status(200).json({
                success: true,
                message: 'Update restaurant successfully',
                restaurant,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },



    ///role admin
    getStatistic: async (req, res) => {
        try {
            const totalRestaurant = await Restaurant.countDocuments();
            const totalUser = await User.countDocuments();
            const totalShipper = await Shipper.countDocuments();
            const year = req.query.year || 2023; // Năm được người dùng nhập vào

            const totalRevenueByMonth = await Order.aggregate([
                {
                    $match: {
                        status: 'delivered',
                        createdAt: {
                            $gte: new Date(year, 0, 1),
                            $lte: new Date(year, 11, 31)
                        }
                    }
                },
                {
                    $group: {
                        _id: { $month: '$createdAt' },
                        totalRevenue: { $sum: '$total' }
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
            const data = {
                totalRestaurant,
                totalUser,
                totalShipper,
                totalRevenueByMonth: totalRevenueByMonth
            }
            return res.status(200).json({
                success: true,
                data
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }


}

module.exports = dashboardController;