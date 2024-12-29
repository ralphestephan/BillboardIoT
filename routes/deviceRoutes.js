const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');

// Routes
router.get('/', deviceController.getAllDevices); // Fetch all devices
router.get('/:device_id', deviceController.getDeviceById); // Fetch a specific device by device_id
router.put('/:device_id', deviceController.updateDevice); // Update a device (e.g., assign billboard_id or coordinates)
router.delete('/:device_id', deviceController.deleteDevice); // Delete a device by device_id

module.exports = router;
