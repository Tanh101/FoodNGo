const exress = require('express');
const User = require('../models/User');
const Account = require('../models/Account');

const userController = {
    getUserById: async (req, res) => {
        const id = req.user.userId;
        try {
            const user = await User.findById(id);
            const account = await Account.findById(user.account);
            const { password, ...accountWithoutPassword } = account._doc;
            if (user) {
                return res.status(200).json({
                    success: true,
                    message: 'Get user successfully',
                    user,
                    accountWithoutPassword

                });
            }
            else {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },


    updateUserById: async (req, res) => {
        const id = req.user.userId;
        const { name, dob, gender, phone, avatar, location, address } = req.body;

        try {
            const user = User.findById(id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }
            const updated = await User.findByIdAndUpdate(id, {
                name: name,
                dob: dob,
                gender: gender,
                phone: phone,
                avatar: avatar,
                location: location,
                address: address
            }, { new: true });

            return res.status(200).json({
                success: true,
                message: 'Update user successfully',
                updated
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },


}

module.exports = userController;
