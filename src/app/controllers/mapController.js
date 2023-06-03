const mapService = require('../../service/mapService');
const { DELIVERY_FEE_PER_KM_GREAT_THAN_FIVE, DELIVERY_BASE_FEE, AVERAGE_DELIVERY_SPPED, PREPARING_TIME } = require('../../utils/constants');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Restaurant = require('../models/Restaurant');
const geolib = require('geolib');
const mapController = {

    search: async (req, res, next) => {
        try {
            const query = req.query.address;
            if (!query) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing query'
                });
            }
            const predictions = await mapService.search(query);
            if (!predictions) {
                return res.status(500).json({
                    success: false,
                    message: 'Failed to search address'
                });
            }
            return res.status(200).json({
                success: true,
                message: 'Search address successfully',
                predictions,
            });

        } catch (err) {
            next(err);
        }
    },

    getGeoCode: async (req, res, next) => {
        try {
            const placeId = req.query.placeId;
            if (!placeId) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing placeId'
                });
            }
            const geoCode = await mapService.getGeoCode(placeId);
            if (!geoCode) {
                return res.status(500).json({
                    success: false,
                    message: 'Failed to get geo code'
                });
            }
            return res.status(200).json({
                success: true,
                message: 'Get geo code successfully',
                geoCode,
            });

        } catch (err) {
            next(err);
        }
    },
    getAddressByLocation: async (req, res) => {
        try {
            const address = await mapService.getAddressFromLocation(req.query.longitude, req.query.latitude);
            if (address) {
                return res.status(200).json({
                    success: true,
                    message: "Get address successfully",
                    address
                });
            }
            return res.status(404).json({
                success: false,
                message: "Address Not Found!",
                address
            });
        } catch (error) {
            return res.status(404).json({
                success: false,
                message: error.message,
            });
        }
    },
    getDistance: async (req, res) => {
        try {
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
                let deliveryFee = DELIVERY_BASE_FEE;
                if (distance > 5.0) {
                    deliveryFee += DELIVERY_FEE_PER_KM_GREAT_THAN_FIVE;
                } else {
                    deliveryFee += distance * DELIVERY_FEE_PER_KM;
                }
                let deliveryTime = distance * 60 / (1000 * AVERAGE_DELIVERY_SPPED) + PREPARING_TIME;
                return res.status(200).json({
                    success: true,
                    message: 'Get distance successfully',
                    delivery: {
                        distance,
                        deliveryFee,
                        deliveryTime
                    }
                });
            } else {
                return res.status(404).json({
                    success: false,
                    message: 'Cart is empty'
                });
            }
        } catch (error) {
            return res.status(404).json({
                success: false,
                message: error.message,
            });
        }
    }

}

module.exports = mapController;