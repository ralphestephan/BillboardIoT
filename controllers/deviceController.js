const db = require('../config/dbConfig');
const mqtt = require('mqtt');

// MQTT Configuration
const mqttConfig = {
  host: 'mqtt://localhost', // Replace with your MQTT broker address
  topic: 'devices/coordinates', // Replace with your topic
};

const client = mqtt.connect(mqttConfig.host);

// Subscribe to the topic
client.on('connect', () => {
  console.log(`Connected to MQTT broker at ${mqttConfig.host}`);
  client.subscribe(mqttConfig.topic, (err) => {
    if (err) {
      console.error(`Failed to subscribe to topic ${mqttConfig.topic}:`, err);
    } else {
      console.log(`Subscribed to topic ${mqttConfig.topic}`);
    }
  });
});

// Handle incoming MQTT messages
client.on('message', async (topic, message) => {
  if (topic === mqttConfig.topic) {
    try {
      const payload = JSON.parse(message.toString()); // Parse the incoming JSON
      const { device_id, coordinates } = payload;

      if (!device_id || !coordinates) {
        console.error('Invalid payload received:', payload);
        return;
      }

      // Check if device exists in the database
      const [existing] = await db.query('SELECT * FROM Devices WHERE device_id = ?', [device_id]);

      if (existing.length > 0) {
        // Update existing device's coordinates
        await db.query(
          'UPDATE Devices SET coordinates = ST_GeomFromText(?) WHERE device_id = ?',
          [`POINT(${coordinates.lat} ${coordinates.lng})`, device_id]
        );
        console.log(`Updated coordinates for device_id: ${device_id}`);
      } else {
        // Insert new device into the database
        await db.query(
          'INSERT INTO Devices (device_id, coordinates) VALUES (?, ST_GeomFromText(?))',
          [device_id, `POINT(${coordinates.lat} ${coordinates.lng})`]
        );
        console.log(`Added new device with device_id: ${device_id}`);
      }
    } catch (error) {
      console.error('Error processing MQTT message:', error);
    }
  }
});

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
    const [result] = await db.query(query, [
      billboard_id || null,
      coordinates ? `POINT(${coordinates.lat} ${coordinates.lng})` : null,
      device_id,
    ]);

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
