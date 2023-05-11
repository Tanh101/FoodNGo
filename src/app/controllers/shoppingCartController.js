const express = require('express');
const Cart = require('../models/Cart');
const shoppingCartController = {
    getCart: async (req, res) => {
        try {
            const userId = req.user.userId;
            const cart = await Cart.find({ user: userId }).populate('product').sort({ createdAt: 1 });
            if (cart) {
                return res.status(200).json({
                    success: true,
                    message: 'Cart fetched successfully',
                    cart
                });
            }
            return res.status(200).json({
                success: true,
                message: 'Cart fetched successfully',
                cart: []
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });

        }
    },

    addToCart: async (req, res) => {
        try {
            const userId = req.user.userId;
            const { productId, quantity } = req.body;
            const cartUser = await Cart.findOne({ user: userId });
            if (cartUser) {
                const product = await Cart.findOne({user: userId,  product: productId });
                if (product) {
                    cartUser.quantity += quantity;
                    await cartUser.save();
                    return res.status(201).json({
                        success: true,
                        message: 'Cart updated successfully',
                        cartUser
                    });
                } else {
                    const cartProduct = new Cart({
                        user: userId,
                        product: productId,
                        quantity: quantity
                    });
                    await cartProduct.save();
                    return res.status(201).json({
                        success: true,
                        message: 'Add item successfully',
                        cartProduct
                    });
                }
            }
            else {
                const cart = new Cart({
                    user: userId,
                    product: productId,
                    quantity: quantity
                });
                await cart.save();
                return res.status(201).json({
                    success: true,
                    message: 'Cart created successfully',
                    cart
                });
            }
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    removeCart: async (req, res) => {
        try {
            const { productId } = req.body;
            const userId = req.user.userId;
            const cartUser = await Cart.findOneAndDelete({ user: userId, product: productId });
            return res.status(200).json({
                success: true,
                message: 'Cart removed successfully',
                cartUser
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    deleteCart: async (req, res) => {
        try {
            const userId = req.user.userId;
            const cartUser = await Cart.deleteMany({ user: userId });
            return res.status(200).json({
                success: true,
                message: 'Cart deleted successfully',
                cartUser: cartUser
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    updateCart: async (req, res) => {
        try {
            const userId = req.user.userId;
            const { productId, quantity } = req.body;
            let cartUser = await Cart.findOne({ user: userId });
            if (cartUser) {
                let productCart = await Cart.findOne({ user: userId, product: productId });
                if (productCart) {
                    productCart.quantity = quantity;
                    await productCart.save();
                    return res.status(200).json({
                        success: true,
                        message: 'Cart updated successfully',
                        productCart
                    });
                }
            }
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            })
        }
    }
}

module.exports = shoppingCartController;