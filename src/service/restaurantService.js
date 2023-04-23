const { Client } = require('@googlemaps/google-maps-services-js');
const Restaurant = require('../app/models/Restaurant');

class RestaurantService {
    async findNearbyRestaurants(req, res) {
        try {
            // Lấy vị trí từ query parameter
            const location = req.body.location;
            const coordinates = location.split(',').map(coord => parseFloat(coord));

            // Tìm kiếm các nhà hàng gần vị trí người dùng trong cơ sở dữ liệu
            const restaurants = await Restaurant.find({
                location: {
                    $near: {
                        $geometry: {
                            type: 'Point',
                            coordinates: coordinates
                        },
                        $maxDistance: 3000 // Bán kính tìm kiếm (đơn vị: mét)
                    }
                }
            });

            // Gửi danh sách các nhà hàng làm phản hồi của API
            return res.json(restaurants);
        } catch (error) {
            return res.status(500).json({
                error: 'Failed to fetch restaurants'
            });
        }
    }

    
}

module.exports = RestaurantService;