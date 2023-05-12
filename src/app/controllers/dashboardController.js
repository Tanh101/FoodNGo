const express = require('express');
const Restaurant = require('../models/Restaurant');
const User = require('../models/User');
const Account = require('../models/Account');
const Category = require('../models/Category');

const dashboardController = {
    getAllRestaurants: async (req, res) => {
        let restaurants = null;
        let { status } = req.query;
        try {
            if (status) {
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
                    }
                ]).exec();
            }
            else {
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
                    }

                ]).exec();
            }
            const response = restaurants.map(restaurant => {
                return {
                    restaurant,
                    account: restaurant.account
                };
            }
            );
            return res.status(200).json({
                success: true,
                response
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

            restaurant.status = 'online';
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
    
    getRestaurantById: async (req, res) => {
        try {
            const restaurant = await Restaurant.findById(req.params.id);
            if(restaurant){
                return res.status(200).json({
                    success: true,
                    restaurant
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
 
    getAllUsers: async (req, res) => {
        try {
            let { status } = req.query;
            let users = null;
            if (status) {
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
                    }
                ]).exec();
            }
            else {
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

            const response = users.map(user => {
                return {
                    user,
                    account: user.account
                };
            });
            return res.status(200).json({
                success: true,
                response
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },
}

module.exports = dashboardController;