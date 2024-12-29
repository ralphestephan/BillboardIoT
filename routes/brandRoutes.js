const express = require('express');
const router = express.Router();
const brandController = require('../controllers/brandController');

// Routes
router.get('/', brandController.getAllBrands); // Fetch all brands
router.get('/:id', brandController.getBrandById); // Fetch a specific brand by ID
router.post('/', brandController.addBrand); // Add a new brand
router.put('/:id', brandController.updateBrand); // Update an existing brand
router.delete('/:id', brandController.deleteBrand); // Delete a brand

module.exports = router;
