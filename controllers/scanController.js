const db = require('../config/dbConfig');
const Influx = require('influx');

const influxConfig = {
  database: 'your-database-name',  // Replace with your InfluxDB database
};

const influx = new Influx.InfluxDB({
  host: 'localhost',
  port: 8086,
  database: influxConfig.database,
});

// Fetch all scans from MySQL
const getAllScans = async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM Scans ORDER BY timestamp ASC');
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Fetch data from InfluxDB v1
const fetchInfluxData = async () => {
  try {
    const results = await influx.query(`
      SELECT * FROM scans
      WHERE time > now() - 1d
    `);

    const rows = results.map((row) => ({
      scan_date: new Date(row.time).toISOString().slice(0, 19).replace('T', ' '),
      device_id: row.device_id,
      scanned_result: row.scan_result,
    }));

    return rows;
  } catch (error) {
    console.error('Error querying InfluxDB:', error);
    throw error;
  }
};

// Store data in MySQL
const storeInMySQL = async (data) => {
  try {
    const insertQuery = `
      INSERT INTO Scans (scan_date, device_id, scanned_result)
      VALUES (?, ?, ?)
    `;
    const connection = await db.getConnection();
    await connection.beginTransaction();

    for (const row of data) {
      await connection.execute(insertQuery, [row.scan_date, row.device_id, row.scanned_result]);
    }

    await connection.commit();
    console.log(`${data.length} scans added successfully.`);
  } catch (error) {
    console.error('Error storing data in MySQL:', error);
  }
};

// Fetch and store scans
const fetchAndStoreScans = async (req, res) => {
  try {
    const data = await fetchInfluxData();
    if (data.length > 0) {
      await storeInMySQL(data);
      res.status(201).json({ message: `${data.length} scans added successfully.` });
    } else {
      res.status(200).json({ message: 'No new scans found in the last 24 hours.' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Scheduled Task
const cron = require('node-cron');
cron.schedule('0 0 * * *', async () => {
  console.log('Scheduled task: Fetching and storing scans...');
  try {
    const data = await fetchInfluxData();
    if (data.length > 0) {
      await storeInMySQL(data);
    } else {
      console.log('No new scans found in the last 24 hours.');
    }
  } catch (error) {
    console.error('Error in scheduled task:', error);
  }
});

module.exports = {
  getAllScans,
  fetchAndStoreScans,
};
