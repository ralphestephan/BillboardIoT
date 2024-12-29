# ESP32 Firmware Versions

This directory contains different firmware versions for the ESP32, each tailored to specific functionality.

## Versions

### 1. WiFi to Local Machine
- **Directory**: `wifi-local/`
- **Purpose**: Sends JSON data to the local machine via MQTT using WiFi.
- **Details**:
  - MQTT broker runs locally on `192.168.1.X`.
  - Uses the following JSON structure:
    ```json
    {
      "device_id": "esp32-12345",
      "coordinates": { "lat": 25.276987, "lng": 55.296249 }
    }
    ```

### 2. WiFi to Cloud Server
- **Directory**: `wifi-cloud/`
- **Purpose**: Sends JSON data to a cloud server via MQTT using WiFi.
- **Details**:
  - MQTT broker hosted on `mqtt://broker.cloud-server.com`.

### 3. SIM7080 to Cloud Server
- **Directory**: `sim7080-cloud/`
- **Purpose**: Sends JSON data to a cloud server via MQTT using the SIM7080 module.
- **Details**:
  - Uses cellular connectivity for sending data.
  - Same JSON structure as other versions.
