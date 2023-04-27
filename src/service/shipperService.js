const express = require('express');
const shipperService = {
    createShipper: async (req, res) => {
        try {
            let {name, phone, avatar, location, address} = req.body;
        } catch (error) {
            
        }
    }
};

module.exports = shipperService;