const express = require('express');
const User = require('../app/models/User');

const userService = {
    createUser: async (req, res, idAccount) => {
        try {
            let {email, name,dob, gender, phone, avatar, location, address } = req.body;
            let newUser = new User({
                email,
                name,
                dob,
                gender,
                phone,
                avatar,
                location,
                address,
                account: idAccount,
            });
            await newUser.save();
            return newUser;
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },
};

module.exports = userService;