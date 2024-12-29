#include <WiFi.h>
#include <HTTPClient.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <ESP32QRCodeReader.h>

// WiFi credentials
const char* ssid = "Estephan";
const char* password = "Beirut@2022";

// MQTT broker settings
const char* mqtt_server = "192.168.1.19";  // Replace with your broker IP
const int mqtt_port = 1883;                // Default port
const char* mqtt_device_topic = "devices/register";
const char* mqtt_qr_topic = "qr_codes/results";

// MQTT client setup
WiFiClient espClient;
PubSubClient client(espClient);

// QR Code reader setup
ESP32QRCodeReader reader(CAMERA_MODEL_AI_THINKER);
struct QRCodeData qrCodeData;

// Variables
String device_id = "dv-001";  // Unique identifier for this device
float latitude = 0.0;             // Default latitude
float longitude = 0.0;            // Default longitude
String previousResult = "";
String currentResult = "";
bool validScanFound = false;
const unsigned long scanInterval = 8000;  // 8 seconds per cycle

// Connect to WiFi
void setupWiFi() {
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("WiFi connected");
}

// Connect to MQTT
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

// Fetch coordinates from GeoIP API
void fetchCoordinates() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin("http://ip-api.com/json/");
    int httpCode = http.GET();

    if (httpCode == 200) {
      String payload = http.getString();
      StaticJsonDocument<512> doc;
      DeserializationError error = deserializeJson(doc, payload);

      if (!error) {
        latitude = doc["lat"];
        longitude = doc["lon"];
        Serial.print("Latitude: ");
        Serial.println(latitude);
        Serial.print("Longitude: ");
        Serial.println(longitude);
      } else {
        Serial.println("Failed to parse GeoIP response");
      }
    } else {
      Serial.print("GeoIP HTTP error: ");
      Serial.println(httpCode);
    }
    http.end();
  } else {
    Serial.println("WiFi not connected for GeoIP request");
  }
}

// Send device info to MQTT
void sendDeviceInfo() {
  StaticJsonDocument<256> doc;
  doc["device_id"] = device_id;
  doc["coordinates"]["lat"] = latitude;
  doc["coordinates"]["lng"] = longitude;

  char buffer[256];
  serializeJson(doc, buffer);
  client.publish(mqtt_device_topic, buffer);

  Serial.println("Device info sent!");
  Serial.print("Device ID: ");
  Serial.println(device_id);
  Serial.print("Coordinates: ");
  Serial.print(latitude);
  Serial.print(", ");
  Serial.println(longitude);
}

// Process QR code scanning cycle
void processCurrentCycle() {
  unsigned long startTime = millis();
  unsigned long elapsedTime = 0;
  currentResult = "";
  validScanFound = false;

  while (elapsedTime < scanInterval) {
    if (reader.receiveQrCode(&qrCodeData, 100)) {
      if (qrCodeData.valid) {
        String scannedQR = String((char*)qrCodeData.payload);
        if (!validScanFound) {
          currentResult = scannedQR;  // Take the first valid QR code in the cycle
          validScanFound = true;
        }
      }
    }
    elapsedTime = millis() - startTime;
  }

  if (validScanFound && currentResult != previousResult) {
    previousResult = currentResult;
    sendQRResultToMQTT(currentResult);
  }
}

// Send QR code result to MQTT
void sendQRResultToMQTT(String qrCode) {
  StaticJsonDocument<256> doc;
  doc["device_id"] = device_id;  // Include device_id for association
  doc["scan_result"] = qrCode;

  char buffer[256];
  serializeJson(doc, buffer);
  client.publish(mqtt_qr_topic, buffer);

  Serial.println("QR Code data sent!");
  Serial.print("QR Code: ");
  Serial.println(qrCode);
}

// Setup function
void setup() {
  Serial.begin(115200);
  setupWiFi();
  client.setServer(mqtt_server, mqtt_port);
  connectToMQTT();

  // Fetch coordinates from GeoIP API
  fetchCoordinates();

  // Send device info to MQTT broker
  sendDeviceInfo();

  // Initialize QR Code Reader
  QRCodeReaderSetupErr err = reader.setup();
  if (err != SETUP_OK) {
    Serial.println("QR Code Reader setup failed!");
    while (true) {
      delay(1000);
    }
  }
  reader.begin();
}

// Main loop
void loop() {
  if (!client.connected()) {
    connectToMQTT();
  }
  client.loop();
  processCurrentCycle();
}
