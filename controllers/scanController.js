const db = require('../config/dbConfig');
const influx = require('../config/influxConfig');
const cron = require('node-cron');

// Fetch all scans from MySQL
const getAllScans = async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM Scans ORDER BY scan_date ASC');
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Fetch data from InfluxDB for a dynamic time range
const fetchInfluxData = async (timeRange) => {
  try {
    console.log(`Fetching scans from InfluxDB within the past ${timeRange}...`);

    // Query InfluxDB for scans in the specified time range
    const results = await influx.query(`
      SELECT * FROM scans
      WHERE time > now() ${timeRange}
    `);

    // Map results to MySQL-compatible format
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

// Store fetched data into MySQL
const storeInMySQL = async (data) => {
  if (data.length === 0) return;

  try {
    const insertQuery = `
      INSERT INTO Scans (scan_date, device_id, scanned_result)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE scanned_result = VALUES(scanned_result)
    `;

    const connection = await db.getConnection();
    await connection.beginTransaction();

    for (const row of data) {
      await connection.execute(insertQuery, [row.scan_date, row.device_id, row.scanned_result]);
    }

    await connection.commit();
    console.log(`${data.length} new scans added successfully.`);
  } catch (error) {
    console.error('Error storing data in MySQL:', error);
  }
};


// Scheduled Task: Fetch and store scans every minute
cron.schedule('*/1 * * * *', async () => { // Run every minute
  console.log('Scheduled task: Fetching and storing scans...');
  try {
    const data = await fetchInfluxData('-60s'); // Fetch data from the last 1 minute
    if (data.length > 0) {
      await storeInMySQL(data);
    } else {
      console.log('No new scans found.');
    }
  } catch (error) {
    console.error('Error in scheduled task:', error);
  }
});

console.log('Cron job scheduled: Fetching scans every minute.');

module.exports = {
  getAllScans,
};
