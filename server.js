const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
const brandRoutes = require('./routes/brandRoutes');
const billboardRoutes = require('./routes/billboardRoutes');
const scanRoutes = require('./routes/scanRoutes');
const deviceRoutes = require('./routes/deviceRoutes.js');

app.use('/api/brands', brandRoutes);
app.use('/api/billboards', billboardRoutes);
app.use('/api/scans', scanRoutes);
app.use('/api/devices', deviceRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
