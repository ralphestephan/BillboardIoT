#include <TinyGsmClient.h>
#include <PubSubClient.h>
#include <ESP32QRCodeReader.h>
#include <ArduinoJson.h>

// SIM7080G Pins
#define RX_PIN 3 // ESP32 RX connected to SIM7080 TX
#define TX_PIN 1 // ESP32 TX connected to SIM7080 RX
#define SERIAL_BAUD 115200

// APN for LTE
const char *apn = "du"; // Replace with your SIM's APN
const char *gprsUser = "";   // Leave blank if not required
const char *gprsPass = "";   // Leave blank if not required

// MQTT broker settings
const char *mqtt_server = "13.61.39.237"; // Replace with your broker's public IP
const int mqtt_port = 1883;               // Default MQTT port
const char *mqtt_device_topic = "devices/register";
const char *mqtt_qr_topic = "qr_codes/results";

// SIM7080G Modem and MQTT client
#define TINY_GSM_MODEM_SIM7080
HardwareSerial simSerial(1); // UART1 for SIM7080G
TinyGsm modem(simSerial);
TinyGsmClient gsmClient(modem);
PubSubClient client(gsmClient);

// QR Code Reader
ESP32QRCodeReader reader(CAMERA_MODEL_AI_THINKER);
struct QRCodeData qrCodeData;

// Variables
String device_id = "dv-001"; // Unique identifier for the device
String previousResult = "";
String currentResult = "";
bool validScanFound = false;
const unsigned long scanInterval = 8000; // 8 seconds per cycle

void setup() {
  // Initialize Serial
  Serial.begin(SERIAL_BAUD);
  simSerial.begin(115200, SERIAL_8N1, RX_PIN, TX_PIN);

  // Initialize QR Code Reader
  reader.setup();
  reader.begin();

  // Initialize Modem
  Serial.println("Initializing modem...");
  if (!modem.restart()) {
    Serial.println("Failed to restart modem");
    while (true) {
      delay(1000);
    }
  }

  // Connect to cellular network
  modem.gprsConnect(apn, gprsUser, gprsPass);
  if (!modem.isGprsConnected()) {
    Serial.println("Failed to connect to cellular network");
    while (true) {
      delay(1000);
    }
  }
  Serial.println("Connected to cellular network!");

  // Setup MQTT
  client.setServer(mqtt_server, mqtt_port);
  connectToMQTT();

  // Send device registration with GPS data
  sendDeviceInfo();
}

void connectToMQTT() {
  while (!client.connected()) {
    Serial.print("Connecting to MQTT...");
    if (client.connect("ESP32Client")) {
      Serial.println("Connected to MQTT broker!");
    } else {
      Serial.print("Failed, retrying in 5 seconds. State: ");
      Serial.println(client.state());
      delay(5000);
    }
  }
}

void sendDeviceInfo() {
  modem.enableGPS();
  float lat, lon;
  if (modem.getGPS(&lat, &lon)) {
    Serial.println("GPS Location obtained:");
    Serial.print("Latitude: ");
    Serial.println(lat, 6);
    Serial.print("Longitude: ");
    Serial.println(lon, 6);

    // Prepare JSON payload
    StaticJsonDocument<256> doc;
    doc["device_id"] = device_id;
    doc["coordinates"]["lat"] = lat;
    doc["coordinates"]["lng"] = lon;

    char buffer[256];
    serializeJson(doc, buffer);
    client.publish(mqtt_device_topic, buffer);
    Serial.println("Device info sent to MQTT!");
  } else {
    Serial.println("Failed to get GPS location for device info");
  }
}

void processCurrentCycle() {
  unsigned long startTime = millis();
  unsigned long elapsedTime = 0;
  currentResult = "";
  validScanFound = false;

  // Scan QR codes for 8 seconds
  while (elapsedTime < scanInterval) {
    if (reader.receiveQrCode(&qrCodeData, 100)) {
      if (qrCodeData.valid) {
        String scannedQR = String((char *)qrCodeData.payload);

        if (!validScanFound) {
          currentResult = scannedQR;
          validScanFound = true;
        }
      }
    }
    elapsedTime = millis() - startTime;
  }

  // Send QR code result if valid and different from previous
  if (validScanFound && currentResult != previousResult) {
    previousResult = currentResult;
    sendQRResultToMQTT(currentResult);
  }
}

void sendQRResultToMQTT(String qrCode) {
  // Prepare JSON payload
  StaticJsonDocument<256> doc;
  doc["device_id"] = device_id;
  doc["qrCode"] = qrCode;

  char buffer[256];
  serializeJson(doc, buffer);
  client.publish(mqtt_qr_topic, buffer);

  Serial.println("QR code result sent to MQTT!");
  Serial.print("QR Code: ");
  Serial.println(qrCode);
}

void loop() {
  if (!client.connected()) {
    connectToMQTT();
  }
  client.loop();
  processCurrentCycle();
}
