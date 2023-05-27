require('dotenv').config();

const { Client } = require('@googlemaps/google-maps-services-js');

const client = new Client({});

const mapService = {
    search: async (query) => {
        const response = await client.placeAutocomplete({
            params: {
                input: query,
                key: process.env.GOOGLE_MAPS_API_KEY
            },
            timeout: 1000,
        });
        return response.data;
    },

    getGeoCode: async (placeId) => {
        const response = await client.geocode({
            params: {
                place_id: placeId,
                key: process.env.GOOGLE_MAPS_API_KEY
            },
            timeout: 1000,
        });
        return response.data;
    },

    getAddressFromLocation: async (longitude, latitude) => {
        const response = await client.reverseGeocode({
            params: {
                latlng: `${latitude},${longitude}`,
                key: process.env.GOOGLE_MAPS_API_KEY,
            },
            timeout: 1000,
        });
        return response.data;
    }
}

module.exports = mapService;
