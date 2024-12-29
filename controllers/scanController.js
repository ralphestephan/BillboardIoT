const db = require('../config/dbConfig');
const { InfluxDB } = require('@influxdata/influxdb-client');
const cron = require('node-cron');

// InfluxDB Configuration
const influxConfig = {
  url: 'http://localhost:8086', // Update with your InfluxDB URL
  token: 'your-influxdb-token',
  org: 'your-org',
  bucket: 'your-bucket',
};

// Fetch all scans from MySQL
const getAllScans = async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM Scans ORDER BY timestamp ASC');
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Fetch data from InfluxDB
const fetchInfluxData = async () => {
  const influxClient = new InfluxDB({ url: influxConfig.url, token: influxConfig.token });
  const queryApi = influxClient.getQueryApi(influxConfig.org);

  const query = `
    from(bucket: "${influxConfig.bucket}")
    |> range(start: -1d, stop: now())
    |> filter(fn: (r) => r["_measurement"] == "scans")
    |> keep(columns: ["_time", "device_id", "scan_result"])
  `;

  const rows = [];
  await new Promise((resolve, reject) => {
    queryApi.queryRows(query, {
      next(row, tableMeta) {
        const data = tableMeta.toObject(row);
        const scan_date = new Date(data._time).toISOString().slice(0, 19).replace('T', ' ');
        rows.push({
          scan_date,
          device_id: data.device_id,
          scanned_result: data.scan_result,
        });
      },
      error(error) {
        reject(error);
      },
      complete() {
        resolve();
      },
    });
  });

  return rows;
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

// Fetch and store scans from InfluxDB
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
    console.error('Error in fetchAndStoreScans:', error);
    res.status(500).json({ error: error.message });
  }
};

// Scheduled Task
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

console.log('Cron job scheduled: Fetching scans daily at midnight.');

module.exports = {
  getAllScans,
  fetchAndStoreScans,
};
