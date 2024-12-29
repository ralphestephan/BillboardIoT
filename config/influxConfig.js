const Influx = require('influx');

// InfluxDB Configuration
const influxConfig = {
  url: 'http://localhost:8086',  // Replace 'localhost' with your InfluxDB server IP if remote
  database: 'QRtesting', // Name of the InfluxDB database

};

// Initialize InfluxDB Client
const influx = new Influx.InfluxDB({
  host: 'localhost',                 // Replace with your InfluxDB server IP
  port: 8086,                        // Default InfluxDB port
  database: influxConfig.database,   // Name of your database
});

module.exports = influx;
