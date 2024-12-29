const express = require('express');
const router = express.Router();
const scanController = require('../controllers/scanController');

// Fetch all scans from MySQL
router.get('/', scanController.getAllScans);

// Fetch and store scans on-demand from InfluxDB to MySQL
router.post('/fetch', async (req, res) => {
  try {
    console.log('Manual fetch and store scans triggered...');
    const data = await scanController.fetchInfluxData();
    if (data.length > 0) {
      await scanController.storeInMySQL(data);
      res.status(201).json({ message: `${data.length} scans added successfully.` });
    } else {
      res.status(200).json({ message: 'No new scans found in the last 24 hours.' });
    }
  } catch (error) {
    console.error('Error in manual fetch and store:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
