const express = require('express');
const Order = require('../models/Order');
const { ORDER_STATUSSTATUS_PREPARING, ORDER_STATUS_DELIVERING, ORDER_STATUS_DELIVERED, ORDER_STATUS_CANCELLED, ORDER_STATUS_UNAVAILABLE, ORDER_STATUS_ORDERED } = require('../../utils/constants');
const orderController = {
    createOrder: async (req, res) => {
        const userId = req.user.userId;
        const { paymentMethod, orderItems, total, note } = req.body;
        const order = new Order({
            user: userId,
            paymentMethod,
            orderItems,
            total,
            note
        });
        await order.save();
        if (order) {
            res.status(200).json({
                success: true,
                message: 'Order created successfully',
                order: order
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Order not created'
            });
        }
    },
    acceptPreparing: async (req, res) => {
        try {
            const orderId = req.params.orderId;
            const status = ORDER_STATUSSTATUS_PREPARING;
            const restaurantId = req.user.userId;
            const order = await Order.findById(orderId);
            if (order && order.orderItems[0].product.restaurant === restaurantId
                && order.status === ORDER_STATUS_ORDERED) {

                order.status = status;
                await order.save();
                return res.status(200).json({
                    success: true,
                    message: 'Accept Preparing Order successfully',
                    order: order
                });
            }
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },
    refuseOrder: async (req, res) => {
        try {
            const orderId = req.params.orderId;
            const status = ORDER_STATUS_UNAVAILABLE;
            const restaurantId = req.user.userId;
            const order = await Order.findById(orderId);
            if (order && order.orderItems[0].product.restaurant === restaurantId
                && order.status === ORDER_STATUS_ORDERED) {

                order.status = status;
                await order.save();
                return res.status(200).json({
                    success: true,
                    message: 'Refuse Order successfully',
                    order: order
                });
            }
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    acceptDelivering: async (req, res) => {
        try {
            const orderId = req.params.orderId;
            const { deliveryId } = req.user.userId;
            const order = await Order.findById(orderId);
            if (order) {
                order.shipper = deliveryId;
                order.status = ORDER_STATUS_DELIVERING;
                await order.save();
                res.status(200).json({
                    success: true,
                    message: 'Accept delivering order successfully',
                    order: order
                });
            }
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },
    acceptDelivered: async (req, res) => {
        try {
            const orderId = req.params.id;
            const status = ORDER_STATUS_DELIVERED;
            const order = await Order.findById(orderId);
            if (order) {
                order.status = status;
                await order.save();
                res.status(200).json({
                    success: true,
                    message: 'Accept delivered order successfully',
                    order: order
                });
            }
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },
    cancelOrder: async (req, res) => {
        try {
            const orderId = req.params.orderId;
            const userId = req.user.userId;

            const status = ORDER_STATUS_UNAVAILABLE;
            // const 
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    getOrdersByRestaurant: async (req, res) => {
        try {
            const restaurantId = req.user.userId;
            const orders = await Order.find({ "orderItems.product.restaurant": restaurantId });
            if (orders) {
                return res.status(200).json({
                    success: true,
                    message: 'Get orders successfully',
                    orders: orders
                });
            }
            return res.status(404).json({
                success: false,
                message: 'Orders not found'
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = orderController;