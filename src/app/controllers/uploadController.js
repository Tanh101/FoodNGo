const express = require('express');
const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');
const serviceAccount = require('../../../serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'temp-34931.appspot.com',
});
const bucket = admin.storage().bucket();

const uploadController = {
    uploadImage: async (req, res) => {
        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const fileName = `${uuidv4()}_${file.originalname}`;

        const metadata = {
            contentType: file.mimetype,
            cacheControl: 'public, max-age=31536000',
        };

        const options = {
            destination: fileName,
            metadata: metadata,
        };

        await bucket.upload(file.path, options);

        const [uploadedFile] = await bucket.file(fileName).getSignedUrl({
            action: 'read',
            expires: '03-01-2500', 
        });

        return res.status(200).json({
            success: true,
            message: 'Image uploaded successfully',
            url: uploadedFile,
        });
    },
};

module.exports = uploadController;
