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

    }
}

module.exports = restaurantDashboardController;