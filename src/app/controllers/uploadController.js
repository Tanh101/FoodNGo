const express = require('express');
const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');
const serviceAccount = require('../../../serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'gs://temp-34931.appspot.com',
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

        await bucket.upload(file.path, {
            destination: fileName,
            metadata: metadata,
        });

        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

        return res.status(200).json({
            success: true,
            message: 'Image uploaded successfully',
            publicUrl,
        });
    },
};

module.exports = uploadController;
