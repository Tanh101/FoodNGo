const express = require('express');
const geolib = require('geolib');
const Order = require('../models/Order');
const {
    DELIVERY_BASE_FEE,
    DELIVERY_FEE_PER_KM,
    ORDER_STATUSSTATUS_PREPARING,
    ORDER_STATUS_DELIVERING,
    ORDER_STATUS_DELIVERED,
    ORDER_STATUS_UNAVAILABLE,
    ORDER_STATUS_ORDERED,
    DELIVERY_FEE_PER_KM_GREAT_THAN_FIVE,
    AVERAGE_DELIVERY_SPPED,
    PREPARING_TIME
} = require('../../utils/constants');
const Product = require('../models/Product');
const Restaurant = require('../models/Restaurant');
const Cart = require('../models/Cart');
const restaurantService = require('../../service/restaurantService');

const orderController = {
    getInforCheckout: async (req, res) => {
        try {
            let result = [];
            let totalProduct = 0;
            const userId = req.user.userId;
            const { latitude, longitude } = req.query;
            const cart = await Cart.find({ user: userId });
            if (cart.length > 0) {
                const product = await Product.findById(cart[0].product);
                const restaurant = await Restaurant.findById(product.restaurant);
                if (!restaurant) {
                    return res.status(404).json({
                        success: false,
                        message: 'Restaurant not found'
                    });
                }
                result = await Promise.all(cart.map(async (item) => {
                    const pro = await Product.findById(item.product);
                    totalProduct += pro.price * item.quantity;
                    const quantity = item.quantity;
                    return {
                        pro,
                        quantity,
                        totalPrice: pro.price * quantity
                    };
                }));
                const restaurantCoordinates = {
                    latitude: parseFloat(restaurant.location.coordinates[1]),
                    longitude: parseFloat(restaurant.location.coordinates[0])
                };
                const userCoordinates = {
                    latitude: parseFloat(latitude),
                    longitude: parseFloat(longitude)
                };
                let distance = geolib.getDistance(restaurantCoordinates, userCoordinates);
                distance = parseFloat(distance.toFixed(2));
                let deliveryFee = DELIVERY_BASE_FEE + distance * DELIVERY_FEE_PER_KM / 1000;
                deliveryFee = Math.ceil(deliveryFee / 1000) * 1000
                let deliveryTime = distance * 60 / (1000 * AVERAGE_DELIVERY_SPPED) + PREPARING_TIME;
                let total = totalProduct + deliveryFee;

                return res.status(200).json({
                    success: true,
                    message: 'Cart fetched successfully',
                    restaurant,
                    result,
                    delivery: {
                        distance,
                        deliveryFee,
                        deliveryTime
                    },
                    totalProductPrice: totalProduct,
                    total
                });
            }
            return res.status(200).json({
                success: false,
                message: 'Cart is empty',
                result
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });

        }
    },
    createOrder: async (req, res) => {
        const userId = req.user.userId;
        let orderItems = [];
        let totalProduct = 0;
        let {
            items, restaurantId,
            address, paymentMethod,
            note, location
        } = req.body;
        const isUpdated = await restaurantService.updateOpeningStatus();
        if (!isUpdated) {
            return res.status(403).json({
                success: false,
                message: 'Restaurant is closed'
            });
        }

        const restaurant = await Restaurant.findById(restaurantId);

        if (restaurant.status === 'close') {
            return res.status(400).json({
                success: false,
                message: 'Restaurant is closed'
            });
        }
        const userCoordinates = {
            latitude: parseFloat(location.coordinates[1]),
            longitude: parseFloat(location.coordinates[0])
        };
        orderItems = await Promise.all(items.map(async (item) => {
            const pro = await Product.findById(item.product);
            totalProduct += pro.price * item.quantity;
            const quantity = item.quantity;
            return {
                product: pro,
                quantity,
            };
        }));
        const restaurantCoordinates = {
            latitude: parseFloat(restaurant.location.coordinates[1]),
            longitude: parseFloat(restaurant.location.coordinates[0])
        };
        let distance = geolib.getDistance(restaurantCoordinates, userCoordinates);
        distance = parseFloat(distance).toFixed(2);

        const deliveryFee = DELIVERY_BASE_FEE + distance * DELIVERY_FEE_PER_KM / 1000;
        deliveryFee = Math.ceil(deliveryFee / 1000) * 1000;
        const deliveryTime = distance * 60 / (1000 * AVERAGE_DELIVERY_SPPED) + PREPARING_TIME;
        let total = totalProduct + deliveryFee;
        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: 'Restaurant not found'
            });
        }
        const order = new Order({
            user: userId,
            address,
            paymentMethod,
            restaurant: restaurantId,
            orderItems,
            deliveryFee,
            deliveryTime,
            total,
            note
        });
        await order.save();
        if (order) {
            res.status(200).json({
                success: true,
                message: 'Order created successfully',
                order: order,
                distance: parseFloat(distance)
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