const express = require('express');
const geolib = require('geolib');
const Order = require('../models/Order');
const {
    DELIVERY_BASE_FEE,
    DELIVERY_FEE_PER_KM,
    ORDER_STATUS_DELIVERING,
    ORDER_STATUS_DELIVERED,
    ORDER_STATUS_UNAVAILABLE,
    AVERAGE_DELIVERY_SPPED,
    PREPARING_TIME,
    ORDER_STATUS_PENDING,
    ORDER_STATUS_PREPARING,
    ORDER_ITEM_PER_PAGE,
    ORDER_STATUS_READY,
    ORDER_STATUS_REFUSE,
    ORDER_STATUS_CANCELLED
} = require('../../utils/constants');
const Product = require('../models/Product');
const Restaurant = require('../models/Restaurant');
const Cart = require('../models/Cart');
const User = require('../models/User');
const Shipper = require('../models/Shipper');
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
            return res.status(403).json({
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
        const resId = orderItems[0].product.restaurant;
        if (!resId.toString() === restaurant._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Restaurant is not match'
            });
        }
        const restaurantCoordinates = {
            latitude: parseFloat(restaurant.location.coordinates[1]),
            longitude: parseFloat(restaurant.location.coordinates[0])
        };
        let distance = geolib.getDistance(restaurantCoordinates, userCoordinates);
        distance = parseFloat(distance).toFixed(2);
        let deliveryFee = DELIVERY_BASE_FEE + distance * DELIVERY_FEE_PER_KM / 1000;
        if (distance > 20000) {
            return res.status(403).json({
                success: false,
                message: 'Delivery distance is too far'
            });
        }
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
            const cart = await Cart.find({ user: userId, product: { $in: items.map(item => item.product) } });
            if (cart.length > 0) {
                await Cart.deleteMany({ user: userId, product: { $in: items.map(item => item.product) } });
            }
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
    updateStatusOrderByRestaurant: async (req, res) => {
        try {
            const orderId = req.params.id;
            const status = req.query.status;
            if (!status) {
                return res.status(400).json({
                    success: false,
                    message: 'Status is required'
                });
            }
            const restaurantId = req.user.userId;
            let order = await Order.findById({ _id: orderId });
            if (order && order.orderItems[0].product.restaurant.toString() === restaurantId.toString()) {
                if (status !== ORDER_STATUS_DELIVERING && status !== ORDER_STATUS_DELIVERED) {
                    if (status === ORDER_STATUS_READY && (order.status === ORDER_STATUS_PREPARING) ||
                        order.status === ORDER_STATUS_PENDING) {
                        order.status = status;
                    }
                    else if (status === ORDER_STATUS_PREPARING && order.status === ORDER_STATUS_PENDING) {
                        order.status = status;
                    }
                    else if (status === ORDER_STATUS_REFUSE && (order.status === ORDER_STATUS_PENDING
                        || order.status === ORDER_STATUS_PREPARING)) {
                        order.status = status;

                    } else {
                        return res.status(400).json({
                            success: false,
                            message: 'Status is invalid'
                        });
                    }
                }
                await order.save();
                return res.status(200).json({
                    success: true,
                    message: 'Update status order successfully',
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
                if (order.status !== ORDER_STATUS_READY) {
                    return res.status(400).json({
                        success: false,
                        message: 'Order is not ready'
                    });
                }

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
                if (order.status !== ORDER_STATUS_DELIVERING) {
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
            }
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
            if (!restaurantId) {
                return res.status(403).json({
                    success: false,
                    message: 'Forbidden'
                });
            }

            let orders = [];
            const status = req.query.status;
            const page = req.query.page || 1;
            const limit = req.query.limit || ORDER_ITEM_PER_PAGE;
            let totalResult = 0;
            if (!status) {
                totalResult = await Order.countDocuments({ restaurant: restaurantId });
            } else {
                totalResult = await Order.countDocuments({ restaurant: restaurantId, status: status });
            }
            const totalPage = Math.ceil(totalResult / limit);
            const pagination = {
                page,
                totalResult,
                totalPage
            }
            if (status) {
                orders = await Order.find({ restaurant: restaurantId, status: status })
                    .sort({ _id: 1 })
                    .skip((page - 1) * limit)
                    .limit(limit);
            } else {
                orders = await Order.find({ restaurant: restaurantId })
                    .sort({
                        status: 1,
                        _id: 1
                    })
                    .collation({
                        locale: "en",
                        caseFirst: "upper",
                        numericOrdering: true
                    })
                    .skip((page - 1) * limit)
                    .limit(limit);
            }
            if (orders) {
                orders = await Promise.all(orders.map(async (order) => {
                    const user = await User.findById(order.user);
                    const shipper = await Shipper.findById(order.shipper);
                    return {
                        order,
                        user,
                        shipper
                    };
                }));

                return res.status(200).json({
                    success: true,
                    message: 'Get orders successfully',
                    orders: orders,
                    pagination
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
    },

    getOrdersByUser: async (req, res) => {
        try {
            const userId = req.user.userId;
            if (!userId) {
                return res.status(403).json({
                    success: false,
                    message: 'Forbidden'
                });
            }
            const status = req.query.status;

            let orders = [];
            const page = req.query.page || 1;
            const limit = req.query.limit || ORDER_ITEM_PER_PAGE;
            let totalResult = 0;
            if (!status) {
                totalResult = await Order.countDocuments({ user: userId });
            } else {
                totalResult = await Order.countDocuments({ user: userId, status: status });
            }
            const totalPage = Math.ceil(totalResult / limit);
            const pagination = {
                page,
                totalResult,
                totalPage
            }
            const statusOrder = ['pending', 'preparing', 'ready', 'delivering', 'delivered', 'refused', 'cancelled'];
            if (status) {
                orders = await Order.find({ user: userId, status: status })
                    .sort({ _id: 1 })
                    .skip((page - 1) * limit)
                    .limit(limit);
            } else {
                orders = await Order.find({ user: userId})
                    .sort({
                        status: 1,
                        _id: 1
                    })
                    .collation({
                        locale: "en",
                        caseFirst: "upper",
                        numericOrdering: true
                    })
                    .skip((page - 1) * limit)
                    .limit(limit);
            }

            if (orders) {
                orders = await Promise.all(orders.map(async (order) => {
                    const restaurant = await Restaurant.findById(order.restaurant);
                    let shipper = null;
                    if (order.shipper) {
                        shipper = await Shipper.findById(order.shipper);
                    }

                    return {
                        order,
                        restaurant,
                        shipper
                    };

                }));
                return res.status(200).json({
                    success: true,
                    message: 'Get orders successfully',
                    orders: orders,
                    pagination
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
    },

}

module.exports = orderController;