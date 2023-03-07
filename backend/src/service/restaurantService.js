const { Client } = require('@googlemaps/google-maps-services-js');
const Restaurant = require('../app/models/Restaurant');

class RestaurantService {
    async findNearbyRestaurants(latitude, longitude, radius) {
        try {
            const restaurants = await Restaurant.find({
                location: {
                    $near: {
                        $geometry: {
                            type: "Point",
                            coordinates: [longitude, latitude],
                        },
                        $maxDistance: radius,
                    }
                }
            });
            return restaurants;
        } catch (error) {
            return error;
        }
    }
}

module.exports = RestaurantService;