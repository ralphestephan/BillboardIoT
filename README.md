## **Billboard IoT Application**
A robust IoT-based application to monitor and analyze billboard advertisements using ESP32 devices, MQTT, MySQL, Node.js, and InfluxDB.

### **Table of Contents**
1. [Overview](#overview)
2. [Features](#features)
3. [Technologies Used](#technologies-used)
4. [Project Structure](#project-structure)
5. [Setup Instructions](#setup-instructions)
6. [Usage](#usage)
7. [API Endpoints](#api-endpoints)
8. [Scripts](#scripts)
9. [Contributing](#contributing)
10. [License](#license)

---

### **Overview**
The Billboard IoT project automates billboard advertisement monitoring and analytics. It:
- Collects real-time scan data from ESP32 devices via MQTT.
- Fetches and stores advertisement data for analysis in MySQL.
- Provides APIs for managing devices, billboards, and scans.
- Integrates with InfluxDB for time-series data storage and analytics.

---

### **Features**
- Real-time monitoring of billboard advertisements using IoT devices.
- Automated data fetching and storage from InfluxDB to MySQL.
- Device management (e.g., add, update, delete devices).
- RESTful APIs for accessing data.
- Cron jobs for scheduled tasks like data syncing.
- Tableau-compatible database schema for advanced analytics.

---

### **Technologies Used**
- **Backend**: Node.js, Express
- **Database**: MySQL, InfluxDB
- **IoT Protocol**: MQTT
- **Task Scheduling**: node-cron
- **Excel Integration**: xlsx library for initial data population

---

### **Project Structure**
```
BillboardApp/
├── scripts/                # Standalone scripts (e.g., database population)
│   └── populateDatabase.js
├── controllers/            # Application logic
│   ├── brandController.js
│   ├── billboardController.js
│   ├── deviceController.js
│   └── scanController.js
├── routes/                 # API route definitions
│   ├── brandRoutes.js
│   ├── billboardRoutes.js
│   ├── deviceRoutes.js
│   └── scanRoutes.js
├── config/                 # Configuration files
│   └── dbConfig.js
├── server.js               # Main server entry point
├── package.json            # Project dependencies
├── README.md               # Project documentation
└── node_modules/           # Installed dependencies (auto-generated)
```

---

### **Setup Instructions**

#### **1. Prerequisites**
- Node.js (v14+ recommended)
- MySQL Server
- InfluxDB (running locally or remotely)
- MQTT Broker (e.g., Mosquitto)
- Excel data file: `Bilboard data.xlsx`

#### **2. Clone the Repository**

git clone https://github.com/yourusername/billboard-iot.git
cd billboard-iot

#### **3. Install Dependencies**

npm install


#### **4. Configure Environment Variables**
Create a `.env` file in the root directory with the following:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=AdsDB
MQTT_HOST=mqtt://localhost
INFLUX_URL=http://localhost:8086
INFLUX_TOKEN=your-token
INFLUX_ORG=your-org
INFLUX_BUCKET=your-bucket
```

#### **5. Populate the Database**
Run the database population script:

node scripts/populateDatabase.js


#### **6. Start the Server**

node server.js


---

### **Usage**

#### **Testing APIs**
- Use Postman, Insomnia, or curl to test the endpoints.
- Base URL: `http://localhost:4000`

#### **API Endpoints**
- **Devices**:
  - `GET /api/devices`: Fetch all devices.
  - `GET /api/devices/:device_id`: Fetch a specific device.
  - `POST /api/devices`: Add a new device.
  - `PUT /api/devices/:device_id`: Update device details.
  - `DELETE /api/devices/:device_id`: Delete a device.
- **Scans**:
  - `GET /api/scans`: Fetch all scans.
  - `POST /api/scans/fetch`: Fetch and store new scans from InfluxDB.

---

### **Scripts**

#### **Database Population**
- Run:
  
  node scripts/populateDatabase.js

- Populates the `BrandData` and `Billboards` tables with initial data from `Bilboard data.xlsx`.

#### **Cron Job for Scans**
- Automatically fetches scans daily at midnight.

---

### **Contributing**
1. Fork the repository.
2. Create a new feature branch:
   
   git checkout -b feature-name
   
3. Commit changes:
   
   git commit -m "Add new feature"
   
4. Push to your branch and create a Pull Request.

---

### **License**
This project is licensed under the MIT License. See the `LICENSE` file for details.

---

