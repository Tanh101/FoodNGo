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
    ORDER_STATUS_CANCELED
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
            note, userLocation
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
            latitude: parseFloat(userLocation.coordinates[1]),
            longitude: parseFloat(userLocation.coordinates[0])
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
        const restaurantLocation = restaurant.location;
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
            userLocation,
            restaurantLocation,
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
            const reason = req.body.reason;
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
                        order.reason = null;
                        order.status = status;
                    }
                    else if (status === ORDER_STATUS_PREPARING && order.status === ORDER_STATUS_PENDING) {
                        order.status = status;
                        order.reason = null;
                    }
                    else if (status === ORDER_STATUS_REFUSE && (order.status === ORDER_STATUS_PENDING
                        || order.status === ORDER_STATUS_PREPARING)) {
                        order.status = status;
                        if (!reason) {
                            return res.status(400).json({
                                success: false,
                                message: 'Reason is required'
                            });
                        }
                        order.reason = reason;

                    } else if (status === order.status) {
                        await order.save();
                        return res.status(200).json({
                            success: true,
                            message: 'Update status order successfully',
                            order: order
                        });

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

    updaetOrderByShipper: async (req, res) => {
        try {
            const status = req.query.status;
            const orderId = req.params.id;
            const shipperId = req.user.userId;
            const order = await Order.findOne({ shipper: shipperId, _id: orderId });
            if (order) {
                if (order.status !== ORDER_STATUS_READY
                    && order.status !== ORDER_STATUS_DELIVERING) {
                    return res.status(400).json({
                        success: false,
                        message: 'Order is not ready'
                    });
                }
                if (status === 'delivering' && order.shipper.toString() === shipperId.toString()) {
                    order.status = ORDER_STATUS_DELIVERING;
                } else if (status === 'delivered' && order.shipper.toString() === shipperId.toString()) {
                    order.status = ORDER_STATUS_DELIVERED;
                    order.paymentStatus = 'paid';
                } else if (status === 'refused') {
                    if (req.body.reason) {
                        order.reason = req.body.reason;
                        order.status = ORDER_STATUS_REFUSE;
                    } else {
                        return res.status(400).json({
                            success: false,
                            message: 'Reason is required'
                        });
                    }
                } else {
                    return res.status(400).json({
                        success: false,
                        message: 'Status is invalid'
                    });
                }
                await order.save();
                res.status(200).json({
                    success: true,
                    message: 'Update order status successfully',
                    order: order
                });
            } else {
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
            const orderId = req.params.id;
            const userId = req.user.userId;
            const status = ORDER_STATUS_CANCELED;
            const order = await Order.findById(orderId);
            if (order && order.user.toString() === userId.toString()) {
                if (order.status === 'pending') {
                    if (req.body.reason) {
                        order.reason = req.body.reason;
                        order.status = status;
                        await order.save();
                        return res.status(200).json({
                            success: true,
                            message: 'Order canceled successfully',
                            order: order
                        });
                    }
                    else {
                        return res.status(400).json({
                            success: false,
                            message: 'Reason is required'
                        });
                    }
                }
                return res.status(400).json({
                    success: false,
                    message: 'Order is not pending'
                });

            }
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
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
                    .sort({
                        createAt: -1,
                        _id: 1
                    })
                    .skip((page - 1) * limit)
                    .limit(limit);
            } else {
                orders = await Order.find({ restaurant: restaurantId })
                    .sort({
                        status: 1,
                        createAt: -1,
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
            const isUpdated = await orderController.AutoRefusedOrder();
            if (!isUpdated) {
                return res.status(500).json({
                    success: false,
                    message: 'Failed to update order'
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
            if (status) {
                orders = await Order.find({ user: userId, status: status })
                    .sort({
                        createAt: -1,
                        _id: 1
                    })
                    .skip((page - 1) * limit)
                    .limit(limit);
            } else {
                orders = await Order.find({ user: userId })
                    .sort({
                        createAt: -1,
                        _id: 1
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

    AutoRefusedOrder: async (req, res) => {
        try {
            const orders = await Order.find();
            if (orders) {
                orders.forEach(async (order) => {
                    const currentTime = new Date();
                    const orderTime = order.createdAt;
                    const diffTime = Math.floor((currentTime - orderTime) / 60000);
                    if (order.status === 'delivering' && (diffTime - order.deliveryTime + 30)) {
                        order.status = ORDER_STATUS_REFUSE;
                        order.reason = 'Shipper is not available';
                        await order.save();
                    }
                }
                );
                return true;
            }
            return false;
        }
        catch (error) {
            console.log(error);
            return false;
        }
    },

    getOrderByShipper: async (req, res) => {
        try {
            const shipperId = req.user.userId;
            const status = req.query.status;
            let orders = [];
            const page = req.query.page || 1;
            const limit = req.query.limit || ORDER_ITEM_PER_PAGE;
            let totalResult = 0;
            if (status) {
                orders = await Order.find({ shipper: shipperId, status: status })
                    .sort({
                        createAt: -1,
                        _id: 1
                    })
                    .skip((page - 1) * limit)
                    .limit(limit);
            } else {
                orders = await Order.find({ shipper: shipperId })
                    .sort({
                        createAt: -1,
                        _id: 1
                    })
                    .skip((page - 1) * limit)
                    .limit(limit);
            }
            if (orders) {
                totalResult = orders.length;
                const totalPage = Math.ceil(totalResult / limit);
                const pagination = {
                    page,
                    totalResult,
                    totalPage
                }
                const orderWithRestaurant = await Promise.all(orders.map(async (order) => {
                    const restaurant = await Restaurant.findById(order.restaurant);
                    return {
                        _id: order._id,
                        user: order.user,
                        userLocation: order.userLocation,
                        address: order.address,
                        paymentMethod: order.paymentMethod,
                        status: order.status,
                        paymentStatus: order.paymentStatus,
                        orderItems: order.orderItems,
                        deliveryFee: order.deliveryFee,
                        deliveryTime: order.deliveryTime,
                        total: order.total,
                        note: order.note,
                        restaurant: restaurant,
                        restaurantLocation: order.restaurantLocation,
                        reason: order.reason,
                        createdAt: order.createdAt,
                        updatedAt: order.updatedAt
                    };
                }));
                return res.status(200).json({
                    success: true,
                    message: 'Get order successfully',
                    orders: orderWithRestaurant,
                    pagination
                });
            }
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    findOrderNearShipper: async (req, res) => {
        try {
            const longitude = req.query.longitude;
            const latitude = req.query.latitude;
            const page = req.query.page || 1;
            const limit = req.query.limit || ORDER_ITEM_PER_PAGE;
            const coordinates = [parseFloat(longitude), parseFloat(latitude)];
            const totalResult = await Order.countDocuments({
                status: {
                    $in: ['preparing', 'ready']
                }
            });
            const totalPage = Math.ceil(totalResult / limit);
            const pagination = {
                page,
                totalResult,
                totalPage
            }
            const order = await Order.aggregate([
                {
                    $geoNear: {
                        near: {
                            type: 'Point',
                            coordinates
                        },
                        key: 'restaurantLocation',
                        maxDistance: parseFloat(20000),
                        distanceField: 'dist.calculated',
                        spherical: true
                    }
                },
                {
                    $match: {
                        shipper: null,
                        status: { $in: ['preparing', 'ready'] }
                    }
                },
                {
                    $sort: {
                        'dist.calculated': 1
                    }
                },
                {
                    $skip: (page - 1) * limit
                },
                {
                    $limit: limit
                }

            ]);
            if (order) {
                const orderWithRestaurant = await Promise.all(order.map(async (order) => {
                    const restaurant = await Restaurant.findById(order.restaurant);
                    return {
                        _id: order._id,
                        user: order.user,
                        address: order.address,
                        status: order.status,
                        orderItems: order.orderItems,
                        deliveryFee: order.deliveryFee,
                        deliveryTime: order.deliveryTime,
                        total: order.total,
                        note: order.note,
                        restaurant: restaurant,
                        reason: order.reason,
                        distance: order.dist.calculated,
                        createdAt: order.createdAt,
                        updatedAt: order.updatedAt
                    };
                }));
                return res.status(200).json({
                    success: true,
                    message: 'Get order successfully',
                    orders: orderWithRestaurant,
                    pagination
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

    signOrderByShipper: async (req, res) => {
        try {
            const orderId = req.params.id;
            const order = await Order.findById(orderId);
            if (order) {
                if (order.status == 'ready' || order.status == 'preparing') {
                    if (order.shipper) {
                        return res.status(403).json({
                            success: false,
                            message: 'Order has been received by someone else'
                        });
                    }
                    order.shipper = req.user.userId;
                    await order.save();
                    return res.status(200).json({
                        success: true,
                        message: 'Sign to order successfully'
                    })
                } else {
                    return res.status(400).json({
                        success: false,
                        message: 'Order is not ready'
                    })
                }
            }
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            })
        }
    },

    getOrderDetails: async (req, res) => {
        try {
            const orderId = req.params.id;
            const order = await Order.findById(orderId);
            if (order) {
                const restaurant = await Restaurant.findById(order.restaurant);
                const user = await User.findById(order.user);
                const distance = geolib.getDistance(order.restaurantLocation.coordinates, order.userLocation.coordinates);
                const shipper = await Shipper.findById(order.shipper);
                const orderInfor = {
                    address: order.address,
                    location: order.userLocation,
                    paymentMethod: order.paymentMethod,
                    status: order.status,
                    paymentStatus: order.paymentStatus,
                    orderItems: order.orderItems,
                    deliveryFee: order.deliveryFee,
                    deliveryTime: order.deliveryTime,
                    total: order.total,
                    note: order.note,
                    user: user,
                    restaurant: restaurant,
                    shipper: shipper,
                    distance

                }
                return res.status(200).json({
                    success: true,
                    message: 'Get order details successfully',
                    order: orderInfor
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

    getCurrentOrderByShipper: async (req, res) => {
        try {
            const shipperId = req.user.userId;
            const status = req.query.status;
            let orders = [];
            const page = req.query.page || 1;
            const limit = req.query.limit || ORDER_ITEM_PER_PAGE;
            let totalResult = 0;
            if (status == 'current') {
                orders = await Order.find({
                    shipper: shipperId,
                    status: {
                        $in: ['preparing', 'ready', 'delivering']
                    }
                })
                    .sort({
                        createAt: -1,
                        _id: 1
                    })
                    .skip((page - 1) * limit)
                    .limit(limit);

                totalResult = await Order.countDocuments({
                    shipper: shipperId,
                    status: {
                        $in: ['preparing', 'ready', 'delivering']
                    }
                });
            }
            else if (status === 'completed') {
                orders = await Order.find({
                    shipper: shipperId,
                    status: {
                        $in: ['delivered', 'refused']
                    }
                })
                    .sort({
                        createAt: -1,
                        _id: 1
                    })
                    .skip((page - 1) * limit)
                    .limit(limit);
                totalResult = await Order.countDocuments({
                    shipper: shipperId,
                    status: {
                        $in: ['delivered', 'refused']
                    }
                });
            }

            if (orders) {
                const totalPage = Math.ceil(totalResult / limit);
                const pagination = {
                    page,
                    totalResult,
                    totalPage
                }
                const orderWithRestaurant = await Promise.all(orders.map(async (order) => {
                    const restaurant = await Restaurant.findById(order.restaurant);
                    const user = await User.findById(order.user);
                    return {
                        _id: order._id,
                        user: user,
                        restaurant: restaurant,
                        userLocation: order.userLocation,
                        address: order.address,
                        paymentMethod: order.paymentMethod,
                        status: order.status,
                        paymentStatus: order.paymentStatus,
                        orderItems: order.orderItems,
                        deliveryFee: order.deliveryFee,
                        deliveryTime: order.deliveryTime,
                        total: order.total,
                        note: order.note,
                        restaurantLocation: order.restaurantLocation,
                        reason: order.reason,
                        createdAt: order.createdAt,
                        updatedAt: order.updatedAt
                    };
                }));
                return res.status(200).json({
                    success: true,
                    message: 'Get order successfully',
                    orders: orderWithRestaurant,
                    pagination
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

    getTotalPriceByUserID: async (req, res) => {
        try {
            const users = await Order.aggregate([
                {
                    $match: {
                        total: { $gt: 1000000 }
                    },
                    $group: {
                        _id: '$user',
                        total: { $sum: '$total' }
                    }

                }
            ]);
            return res.status(200).json({
                success: true,
                message: 'Get total price by user successfully',
                users: users
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