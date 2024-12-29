const db = require('../config/dbConfig');
const mqtt = require('mqtt');

// MQTT Configuration
const mqttConfig = {
  host: 'mqtt://localhost',
  pot: 1883,
  topic: 'devices/register',
};

const client = mqtt.connect({
    host: mqttConfig.host,
    port: mqttConfig.port,
  });
  
  client.on('connect', () => {
    console.log(`Connected to MQTT broker at ${mqttConfig.host}:${mqttConfig.port}`);
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
      const payload = JSON.parse(message.toString());
      const { device_id, coordinates } = payload;

      if (!device_id || !coordinates || typeof coordinates.lat !== 'number' || typeof coordinates.lng !== 'number') {
        console.error('Invalid payload received:', payload);
        return;
      }

      const query = `
        INSERT INTO Devices (device_id, coordinates)
        VALUES (?, ST_GeomFromText(?))
        ON DUPLICATE KEY UPDATE coordinates = ST_GeomFromText(?)
      `;

      const point = `POINT(${coordinates.lat} ${coordinates.lng})`;
      await db.query(query, [device_id, point, point]);

      console.log(`Device ${device_id} processed with coordinates ${coordinates.lat}, ${coordinates.lng}`);
    } catch (error) {
      console.error('Error processing MQTT message:', error);
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
