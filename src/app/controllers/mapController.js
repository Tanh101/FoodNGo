const mapService = require('../../service/mapService');

const mapController = {

    search: async (req, res, next) => {
        try {
            const query = req.query.address;
            if(!query) {
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
            if(!placeId) {
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
    }

}

module.exports = mapController;