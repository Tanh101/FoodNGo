const User = require("../models/User");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Account = require('../models/Account');

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

    generateAccesstoken: async (user) => {
        const accessToken = jwt.sign({
            userId: user._id,
            username: user.username
        }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1000s' });
        return accessToken;
    },

    login: async (req, res) => {
        try {
            // const {username, password} = req.body;
            if (!req.body.username || !req.body.password) {
                return res.status(400).json({
                    success: false,
                    message: "Missing username or password"
                });
            }

            let user = await User.findOne({ username: req.body.username });
            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: 'Incorrect username'
                });
            }
            user = await User.findOne({email})


            const isValidPassword = await bcrypt.compare(req.body.password, user.password);
            if (!isValidPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Incrorrect password'
                });
            }
            //all good
            const { password, ...others } = user._doc;
            const accessToken = await authController.generateAccesstoken(user);
            return res.json({
                success: true,
                message: 'Login successfully',
                ...others,
                accessToken
            });


        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }


};

module.exports = authController;