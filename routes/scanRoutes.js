const express = require('express');
const { getAllScans } = require('../controllers/scanController');

const router = express.Router();

// Route to fetch all scans
router.get('/', getAllScans);

module.exports = router;
