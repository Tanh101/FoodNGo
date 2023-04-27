const User = require("../models/User");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Account = require('../models/Account');
const userController = require('./userController');
const constants = require('../../utils/constants');
const express = require('express');
const userService = require("../../service/userService");
const restaurantService = require("../../service/restaurantService");
require('dotenv').config();


const authController = {
    register: async (req, res) => {
        let newUser = null;
        let { email, role, phone } = req.body;
        try {
            let user = await Account.findOne({ email });
            if (user) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already taken'
                });
            }

            let isExitPhone = await User.findOne({ phone });
            if (isExitPhone) {
                return res.status(400).json({
                    success: false,
                    message: 'Phone number already exists'
                });
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
                restaurantService.createRestaurant(req, res);
            } else if (role === 'shipper') {
                userService.createUser(req, res);
            }
            const {password, ...other} = newAccount._doc;
            if (newUser && newAccount) {
                return res.status(201).json({
                    success: true,
                    message: 'Register successfully',
                    user: newUser,
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
            accountId: account._id,
            role: account.role,
            userId: user._id,
        }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1000s' });
        return accessToken;
    },
    generateRefreshToken: async (account, user) => {
        const refreshToken = jwt.sign({
            accountId: account._id,
            role: account.role,
            userId: user._id,
        }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
        return refreshToken;
    },


    login: async (req, res) => {
        try {
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

            const user = await User.findOne({ account: account });

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
            return res.json({
                success: true,
                message: 'Login successfully',
                user: user,
                ...others,
                accessToken,
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