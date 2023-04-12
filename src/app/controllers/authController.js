const User = require("../models/User");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Account = require('../models/Account');
const userController = require('./userController');
const constants = require('../../utils/constants');
const express = require('express');
require('dotenv').config();


const authController = {
    register: async (req, res) => {
        let { email, role, name, dob, gender, phone, avatar, location, address } = req.body;
        try {
            let user = await Account.findOne({ email });
            if (user) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already taken'
                });
            }
            user = await User.findOne({ phone });
            if (user) {
                return res.status(400).json({
                    success: false,
                    message: 'Phone number already taken'
                });
            }            
            //All good
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(req.body.password, salt);
            let newAccount = new Account({
                email,
                password: hashedPassword,
                role
            });
            newAccount = await newAccount.save();
            const newUser = new User({
                name,
                dob,
                gender,
                phone,
                avatar,
                account: newAccount._id,
                location,
                address,
            });
            await newUser.save();
            const { password, ...others } = newAccount._doc;
            return res.json({
                success: true,
                message: 'Register successfully',
                ...others,
                user: newUser,
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
        }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30s' });
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

            const user = await User.findOne({ account: account});

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
            if( status !== "active" && status !== "inactive" && status !== "deleted" ){
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
            if( role !== "admin" && role !== "user" && role !== "restaurant" && role !== "shipper" && role !== "guest" ){
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