const db = require('../config/dbConfig');
const mqtt = require('mqtt');

const db = require('../config/dbConfig');
const { mqttConfig, client } = require('../config/mqttConfig'); // Import MQTT client and config

// Handle incoming MQTT messages
client.on('message', async (topic, message) => {
  if (topic === mqttConfig.topic) {
    try {
      // Parse the payload
      const payload = JSON.parse(message.toString());
      const { device_id, coordinates } = payload;

      if (!device_id || !coordinates || typeof coordinates.lat !== 'number' || typeof coordinates.lng !== 'number') {
        console.error('Invalid payload received:', payload);
        return;
      }

      const point = `POINT(${coordinates.lat} ${coordinates.lng})`;

      // Insert or update the device in the database
      const query = `
        INSERT INTO Devices (device_id, coordinates)
        VALUES (?, ST_GeomFromText(?))
        ON DUPLICATE KEY UPDATE coordinates = ST_GeomFromText(?)
      `;

      console.log('Executing query:', query);
      console.log('Parameters:', [device_id, point, point]);

      // Perform the database query
      await db.query(query, [device_id, point, point]);

      console.log(`Device ${device_id} processed with coordinates (${coordinates.lat}, ${coordinates.lng})`);
    } catch (error) {
      console.error('Error processing MQTT message:', error.message);
    }
  }
});

// Fetch all devices
const getAllDevices = async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM Devices');
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Fetch a specific device by device_id
const getDeviceById = async (req, res) => {
  const { device_id } = req.params;
  try {
    const [results] = await db.query('SELECT * FROM Devices WHERE device_id = ?', [device_id]);
    if (results.length === 0) {
      return res.status(404).json({ message: 'Device not found' });
    }
    res.json(results[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a device (e.g., assign billboard_id or update coordinates)
const updateDevice = async (req, res) => {
  const { device_id } = req.params;
  const { billboard_id, coordinates } = req.body;
  try {
    const query = `
      UPDATE Devices
      SET
        billboard_id = COALESCE(?, billboard_id),
        coordinates = COALESCE(ST_GeomFromText(?), coordinates)
      WHERE device_id = ?
    `;
    const point = coordinates ? `POINT(${coordinates.lat} ${coordinates.lng})` : null;
    const [result] = await db.query(query, [billboard_id || null, point, device_id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Device not found' });
    }
    res.json({ message: 'Device updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a device by device_id
const deleteDevice = async (req, res) => {
  const { device_id } = req.params;
  try {
    const query = 'DELETE FROM Devices WHERE device_id = ?';
    const [result] = await db.query(query, [device_id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Device not found' });
    }
    res.json({ message: 'Device deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
    getAllDevices,
    getDeviceById,
    updateDevice,
    deleteDevice,
  };
