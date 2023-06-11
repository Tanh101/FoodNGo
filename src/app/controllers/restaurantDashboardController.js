const Order = require("../models/Order")
const mongoose = require('mongoose');
const Product = require("../models/Product");

const restaurantDashboardController = {
    getBestSellingItems: async (req, res) => {
        try {
            const restaurantId = req.user.userId;
            const limit = req.query.limit || 1;
            const products = await Order.aggregate([
                {
                    $match: {
                        restaurant: mongoose.Types.ObjectId(restaurantId),
                        status: 'delivered',
                    },
                },
                {
                    $unwind: '$orderItems',
                },
                {
                    $group: {
                        _id: '$orderItems.product._id',
                        totalQuantity: { $sum: '$orderItems.quantity' },
                    },
                },
                {
                    $lookup: {
                        from: 'products',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'product',
                    },
                },
                {
                    $unwind: '$product',
                },
                {
                    $project: {
                        _id: 0,
                        productId: '$_id',
                        productName: '$product.name',
                        totalQuantity: 1,
                    },
                },
                {
                    $sort: {
                        totalQuantity: -1,
                    },
                },
                {
                    $limit: limit,
                },
            ]);
            const productInfor = await Promise.all(products.map(async (product) => {
                const productInfor = await Product.findById(product.productId);
                return {
                    ...product,
                    productImage: productInfor.media,
                    productPrice: productInfor.price,
                    productDescription: productInfor.description,
                };
            }));
            return res.status(200).json({
                sucess: true,
                message: 'Get best selling items successfully',
                products: productInfor
            });
        } catch (error) {
            return res.status(500).json({
                sucess: false,
                error: error.message
            });
        }

    },

    getRevenue: async (req, res) => {
        try {
            const restaurantId = req.user.userId;
            const year = req.query.year || 2023; // Năm được người dùng nhập vào

            const totalRevenueByMonth = await Order.aggregate([
                {
                    $match: {
                        status: 'delivered',
                        restaurant: mongoose.Types.ObjectId(restaurantId),
                        createdAt: {
                            $gte: new Date(year, 0, 1), // Bắt đầu từ ngày đầu tiên của năm
                            $lte: new Date(year, 11, 31) // Kết thúc vào ngày cuối cùng của năm
                        }
                    }
                },
                {
                    $group: {
                        _id: { $month: '$createdAt' },
                        totalRevenue: { $sum: { $subtract: ['$total', '$deliveryFee'] } }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        month: '$_id',
                        totalRevenue: 1
                    }
                },
                {
                    $sort: {
                        month: 1
                    }
                }
            ]);

            const totalProduct = await Order.aggregate([
                {
                    $match: {
                        status: 'delivered',
                        restaurant: mongoose.Types.ObjectId(restaurantId)
                    }
                },
                {
                    $unwind: '$orderItems'
                },
                {
                    $group: {
                        _id: null,
                        totalProduct: { $sum: '$orderItems.quantity' },
                        totalCustomer: { $addToSet: '$user' },
                        totalOrder: { $addToSet: '$_id' }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        totalProduct: 1,
                        totalCustomer: { $size: '$totalCustomer' },
                        totalOrder: { $size: '$totalOrder' }
                    }
                }
            ]);


            return res.status(200).json({
                sucess: true,
                message: 'Get revenue successfully',
                totalRevenue: totalRevenueByMonth,
                totalProduct
            });

        } catch (error) {
            return res.status(500).json({
                sucess: false,
                error: error.message
            });
        }
    },
}

module.exports = restaurantDashboardController;