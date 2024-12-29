const express = require('express');
const router = express.Router();
const billboardController = require('../controllers/billboardController');

// Routes
router.get('/', billboardController.getAllBillboards); // Fetch all billboards
router.get('/:id', billboardController.getBillboardById); // Fetch a specific billboard by ID
router.post('/', billboardController.addBillboard); // Add a new billboard
router.put('/:id', billboardController.updateBillboard); // Update an existing billboard
router.delete('/:id', billboardController.deleteBillboard); // Delete a billboard

module.exports = router;
