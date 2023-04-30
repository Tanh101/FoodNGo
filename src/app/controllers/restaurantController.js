const express = require('express');
const Restaurant = require('../models/Restaurant');
const restaurantService = require('../../service/restaurantService');

const restaurantController = {

    findNearbyRestaurants: async (req, res) => {
        const restaurants = RestaurantService.
            findNearbyRestaurants(req, res);
        if (!restaurants) {
            return res.status(500).json({
                success: false,
                message: 'Failed to find restaurants near you'
            });
        }
    },

    createRestaurant: async (req, res) => {
        try {
            const res = req.body;

            const restaurant = new Restaurant({
                name: res.name,
                address: res.address,
                location: res.location,
                media: res.media,
                url: res.url,
                phone: res.phone,
                description: res.description,
                rate: res.rate,
                status: res.status,
                delete_at: res.delete_at,
                create_at: res.create_at,
                update_at: res.update_at,
            });

            return res.json({
                success: true,
                message: 'Create restaurant successfully',
                restaurant,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    getAllRestaurants: async (req, res) => {
        let restaurants = null;
        try {
            const role = req.query.role;
            const longtitude = req.query.longtitude;
            const latitude = req.query.latitude;

            if (role === 'admin') {
                // restaurants = await Restaurant.find();
            } else if (longtitude && latitude) {
                restaurants = await restaurantService.findNearbyRestaurants(req, res);
                if (restaurants) {
                    return res.json({
                        success: true,
                        message: 'Get all restaurants successfully',
                        restaurants,
                    });
                }
                else {
                    return res.status(404).json({
                        success: false,
                        message: 'Restaurant not found',
                    });
                }
            }
            else {
                restaurants = await Restaurant.find({ status: 'online' });
                return res.json({
                    success: true,
                    message: 'Get all restaurants successfully',
                    restaurants,
                });
            }
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    getRestaurantById: async (req, res) => {
        try {
            const restaurant = await Restaurant.findById(req.params.id);
            if (!restaurant) {
                return res.status(404).json({
                    success: false,
                    message: 'Restaurant not found',
                });
            }
            return res.json({
                success: true,
                message: 'Get restaurant successfully',
                restaurant,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    //update status to offline
    updateRestaurantStatus: async (req, res) => {
        try {
            const status = req.body.status;
            if (status !== 'offline' || status !== 'online' || status !== 'deleted') {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid status',
                });
            }

            const restaurant = await Restaurant.findOne({ _id: req.params.id });
            if (!restaurant) {
                return res.status(404).json({
                    success: false,
                    message: 'Restaurant not found',
                });
            }
            restaurant.status = status;
            await restaurant.save();
            return res.json({
                success: true,
                message: 'Delete restaurant successfully',
                restaurant,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
        //update status
    },

    updateRestaurantById: async (req, res) => {
        try {
            const res = req.body;
            const restaurant = await Restaurant.
                findByIdAndUpdate(req.params.id, {
                    name: res.name,
                    address: res.address,
                    location: res.location,
                    media: res.media,
                    url: res.url,
                    phone: res.phone,
                    description: res.description,
                    rate: res.rate,
                    status: res.status,
                    delete_at: res.delete_at,
                }, { new: true });

            if (!restaurant) {
                return res.status(404).json({
                    success: false,
                    message: 'Restaurant not found',
                });
            }
            return res.json({
                success: true,
                message: 'Update restaurant successfully',
                restaurant,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

}

module.exports = restaurantController;

