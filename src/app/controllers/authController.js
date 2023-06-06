const User = require("../models/User");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Account = require('../models/Account');
const userController = require('./userController');
const constants = require('../../utils/constants');
const express = require('express');
const userService = require("../../service/userService");
const restaurantService = require("../../service/restaurantService");
const Restaurant = require("../models/Restaurant");
require('dotenv').config();

const refreshTokens = {};

const authController = {
    userRegister: async (req, res) => {
        try {
            let role = 'user';
            const { email, phone, } = req.body;
            if (!email || !req.body.password) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing email or password'
                });
            }
            let account = await Account.findOne({ email });
            if (account) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already taken'
                });
            }
            let isExitPhone = await User.findOne({ phone });
            if (isExitPhone) {
                return res.status(400).json({
                    success: false,
                    message: 'Phone already taken'
                });
            }
            if (!constants.isPhoneNumber(phone)) {
                return res.status(400).json({
                    success: false,
                    message: 'Phone number is not valid'
                });
            }

            //All good
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(req.body.password, salt);

            let state = constants.ACCOUNT_STATUS_ACTIVE;
            let newAccount = new Account({
                email,
                password: hashedPassword,
                role,
                status: state || constants.ACCOUNT_STATUS_ACTIVE,
            });
            newAccount = await newAccount.save();
            let newUser = await userService.createUser(req, res, newAccount._id);
            const { password, ...other } = newAccount._doc;
            if (newUser && newAccount) {
                return res.status(201).json({
                    success: true,
                    message: 'Register successfully',
                    user: newUser,
                    ...other,
                });
            }
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },
    restaurantRegister: async (req, res) => {
        try {
            let role = 'restaurant';
            const { email, phone, name } = req.body;
            const isExitName = await Restaurant.findOne({ name });
            if (isExitName) {
                return res.status(400).json({
                    success: false,
                    message: 'Name already taken'
                });
            }

            if (!email || !req.body.password) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing email or password'
                });
            }
            let account = await Account.findOne({ email });
            if (account) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already taken'
                });
            }
            let isExitPhone = await User.findOne({ phone });
            if (isExitPhone) {
                return res.status(400).json({
                    success: false,
                    message: 'Phone already taken'
                });
            }
            if (!constants.isPhoneNumber(phone)) {
                return res.status(400).json({
                    success: false,
                    message: 'Phone number is not valid'
                });
            }
            let state = constants.ACCOUNT_STATUS_PENDING;

            //All good
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(req.body.password, salt);
            let newAccount = new Account({
                email,
                password: hashedPassword,
                role,
                status: state || constants.ACCOUNT_STATUS_ACTIVE,
            });
            newAccount = await newAccount.save();
            const { password, ...other } = newAccount._doc;
            let newRestaurant = await restaurantService.createRestaurant(req, res, newAccount._id);
            if (newRestaurant && newAccount) {
                return res.status(201).json({
                    success: true,
                    message: 'Register successfully',
                    restaurant: newRestaurant,
                    ...other,
                });
            }
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    register: async (req, res) => {
        let newUser = null;
        let newRestaurant = null;
        let newShipper = null;

        let { email, role, phone } = req.body;
        try {
            let user = await Account.findOne({ email });
            if (user) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already taken'
                });
            }
            let isExitPhone = null;
            if (role === 'user') {
                isExitPhone = await User.findOne({ phone });
            } else if (role === 'restaurant') {
                isExitPhone = await Restaurant.findOne({ phone });
            } else if (role === 'shipper') {
                console.log('doing');
            }


            //All good
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(req.body.password, salt);

            let state = constants.ACCOUNT_STATUS_ACTIVE;
            if (role === 'restaurant' || role === 'shipper') {
                state = constants.ACCOUNT_STATUS_PENDING;
            }

            let newAccount = new Account({
                email,
                password: hashedPassword,
                role,
                status: state || constants.ACCOUNT_STATUS_ACTIVE,
            });
            newAccount = await newAccount.save();
            if (role === 'user') {
                newUser = await userService.createUser(req, res, newAccount._id);
            } else if (role === 'restaurant') {
                newRestaurant = await restaurantService.createRestaurant(req, res, newAccount._id);
            } else if (role === 'shipper') {
                userService.createUser(req, res);
            }
            const { password, ...other } = newAccount._doc;
            if (newUser && newAccount) {
                return res.status(201).json({
                    success: true,
                    message: 'Register successfully',
                    user: newUser,
                    ...other,
                });
            }

            if (newRestaurant && newAccount) {
                return res.status(201).json({
                    success: true,
                    message: 'Register successfully',
                    restaurant: newRestaurant,
                    ...other,
                });
            }

            return res.status(500).json({
                success: false,
                message: 'Server error',
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    generateAccesstoken: async (account, user) => {
        const accessToken = jwt.sign({
            email: account.email,
            role: account.role,
            userId: user._id,
        }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '300s' });
        return accessToken;
    },
    generateRefreshToken: async (account, user) => {
        const refreshToken = jwt.sign(
            {
                role: account.role,
                email: account.email,
                userId: user._id,
            },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '300h' }
        );
        return refreshToken;
    },

    refreshAccessToken: async (req, res) => {
        try {
            const refreshToken = req.body.token;
            if (!refreshToken || !refreshTokens.hasOwnProperty(refreshToken)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid refresh token'
                });
            }
            jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decode) => {
                if (err) {
                    return res.status(400).json({
                        success: false,
                        message: err.message
                    });
                }

                const newAccessToken = jwt.sign({
                    email: decode.email,
                    role: decode.role,
                    userId: decode.userId
                }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '300s' });

                return res.json({
                    success: true,
                    message: 'Refresh token successfully',
                    accessToken: newAccessToken
                });
            });

        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    login: async (req, res) => {
        try {
            let user = null;
            let restaurant = null;
            let shipper = null;
            if (!req.body.email || !req.body.password) {
                return res.status(400).json({
                    success: false,
                    message: "Missing email or password"
                });
            }
            let account = await Account.findOne({ email: req.body.email });
            if (!account) {
                return res.status(400).json({
                    success: false,
                    message: 'Incorrect email'
                });
            }
            if (account.status === constants.ACCOUNT_STATUS_DELETED) {
                return res.status(400).json({
                    success: false,
                    message: 'Account is deleted'
                });
            }
            if (account.status === constants.ACCOUNT_STATUS_PENDING) {
                return res.status(400).json({
                    success: false,
                    message: 'Account is pending'
                });
            }
            if (account.role === 'user' || account.role === 'admin')
                user = await User.findOne({ account: account });
            else if (account.role === 'restaurant')
                user = await Restaurant.findOne({ account: account });
            else if (account.role === 'shipper')
                console.log('doing');

            const isValidPassword = await bcrypt.compare(req.body.password, account.password);
            if (!isValidPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Incrorrect password'
                });
            }
            //all good
            const { password, ...others } = account._doc;
            const accessToken = await authController.generateAccesstoken(account, user);
            const refreshToken = await authController.generateRefreshToken(account, user);
            refreshTokens[refreshToken] = refreshToken;
            return res.status(200).json({
                success: true,
                message: 'Login successfully',
                user: user,
                ...others,
                accessToken,
                refreshToken
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },
    logout: async (req, res) => {
        try {
            const refreshToken = req.body.token;
            if (!refreshToken || !refreshTokens.hasOwnProperty(refreshToken)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid refresh token'
                });
            }
            delete refreshTokens[refreshToken];
            return res.status(200).json({
                success: true,
                message: 'Logout successfully'
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    updateStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body;
            if (status !== "active" && status !== "inactive" && status !== "deleted") {
                return res.status(400).json({
                    success: false,
                    message: 'Status is not valid',
                });
            }

            const account = await Account.findById(id);
            if (!account) {
                return res.status(404).json({
                    success: false,
                    message: 'Account not found',
                });
            }
            account.status = status;
            await account.save();
            return res.json({
                success: true,
                message: 'Update status successfully',
                account,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    updateRole: async (req, res) => {
        try {
            const { id } = req.params;
            const { role } = req.body;
            if (role !== "admin" && role !== "user" && role !== "restaurant" && role !== "shipper" && role !== "guest") {
                return res.status(400).json({
                    success: false,
                    message: 'Role is not valid',
                });
            }
            const account = await Account.findById(id);
            if (!account) {
                return res.status(404).json({
                    success: false,
                    message: 'Account not found',
                });
            }
            account.role = role;
            await account.save();
            return res.json({
                success: true,
                message: 'Update role successfully',
                account,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },
};

module.exports = authController;