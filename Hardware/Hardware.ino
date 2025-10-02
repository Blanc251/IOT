#include <WiFi.h>
#include <PubSubClient.h>
#include "DHT.h"
#include <ArduinoJson.h> 

const char* ssid = "working";
const char* password = "00000000";

const char* mqtt_server = "172.20.10.2"; 
const int   mqtt_port   = 1883;

const char* mqtt_user = "vui";
const char* mqtt_pass = "12345";

const char* MQTT_SUB_TOPIC = "iot/led/control";
const char* MQTT_PUB_TOPIC = "iot/sensor/data";
const char* MQTT_STATUS_TOPIC = "iot/led/status"; 

#define DHTPIN     18
#define DHTTYPE    DHT11
#define LED1_PIN   13
#define LED2_PIN   12
#define LED3_PIN   14
#define ANALOG_PIN 33

DHT dht(DHTPIN, DHTTYPE);
WiFiClient espClient;
PubSubClient client(espClient);

unsigned long previousMillis = 0;
const long interval = 2000; 

// --- HÀM GỬI TRẠNG THÁI ĐÈN LÊN MQTT ---
void publishLedStatus() {
  StaticJsonDocument<128> doc;
  doc["led1"] = (digitalRead(LED1_PIN) == HIGH) ? "on" : "off";
  doc["led2"] = (digitalRead(LED2_PIN) == HIGH) ? "on" : "off";
  doc["led3"] = (digitalRead(LED3_PIN) == HIGH) ? "on" : "off";

  char jsonBuffer[128];
  serializeJson(doc, jsonBuffer);

  Serial.println("DEBUG: Chuan bi gui trang thai den: " + String(jsonBuffer));
  client.publish(MQTT_STATUS_TOPIC, jsonBuffer);
  Serial.println("=> Da gui trang thai den.");
}

// --- HÀM XỬ LÝ LỆNH TỪ MQTT ---
void handleCommand(String cmd) {
  Serial.println("DEBUG: Bat dau xu ly lenh: " + cmd);

  if (cmd.equals("led1on"))       digitalWrite(LED1_PIN, HIGH);
  else if (cmd.equals("led1off")) digitalWrite(LED1_PIN, LOW);
  else if (cmd.equals("led2on"))  digitalWrite(LED2_PIN, HIGH);
  else if (cmd.equals("led2off")) digitalWrite(LED2_PIN, LOW);
  else if (cmd.equals("led3on"))  digitalWrite(LED3_PIN, HIGH);
  else if (cmd.equals("led3off")) digitalWrite(LED3_PIN, LOW);
  else if (cmd.equals("allon")) {
    digitalWrite(LED1_PIN, HIGH);
    digitalWrite(LED2_PIN, HIGH);
    digitalWrite(LED3_PIN, HIGH);
  } else if (cmd.equals("alloff")) {
    digitalWrite(LED1_PIN, LOW);
    digitalWrite(LED2_PIN, LOW);
    digitalWrite(LED3_PIN, LOW);
  } else {
    Serial.println("=> Lenh khong hop le!");
    return;
  }
  Serial.println("=> Lenh da duoc thuc thi.");
  
  // Gọi hàm cập nhật trạng thái sau khi thực thi lệnh
  publishLedStatus();
}

// --- HÀM ĐƯỢC GỌI KHI CÓ TIN NHẮN MQTT ĐẾN ---
void callback(char* topic, byte* payload, unsigned int length) {
  String message = "";
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  Serial.println("---------------------------------");
  Serial.print("Nhan lenh tu topic [");
  Serial.print(topic);
  Serial.print("]: ");
  Serial.println(message);
  
  handleCommand(message);
}

// --- HÀM KẾT NỐI LẠI MQTT ---
void reconnect() {
  while (!client.connected()) {
    Serial.print("Dang ket noi den MQTT Broker...");
    
    String clientId = "ESP32_Client-";
    clientId += String(WiFi.macAddress());

    if (client.connect(clientId.c_str(), mqtt_user, mqtt_pass)) {
      Serial.println("Da ket noi!");
      client.subscribe(MQTT_SUB_TOPIC);
      // Gửi trạng thái ban đầu sau khi kết nối lại
      publishLedStatus();
    } else {
      Serial.print("Loi, rc=");
      Serial.print(client.state());
      Serial.println(" Thu lai sau 5 giay");
      delay(5000);
    }
  }
}

// --- HÀM ĐỌC VÀ GỬI DỮ LIỆU CẢM BIẾN ---
void readAndPublishSensors() {
  float h = dht.readHumidity();
  float t = dht.readTemperature();
  int lightValue = analogRead(ANALOG_PIN);

  if (isnan(h) || isnan(t)) {
    Serial.println("Loi doc cam bien DHT11!");
    return;
  }
  
  char jsonData[128];
  snprintf(jsonData, sizeof(jsonData), "{\"temperature\":%.2f,\"humidity\":%.2f,\"light\":%d}", t, h, lightValue);
  
  Serial.println("DEBUG: Chuan bi gui du lieu: " + String(jsonData));
  client.publish(MQTT_PUB_TOPIC, jsonData);
  Serial.println("=> Da gui du lieu cam bien.");
}

void setup() {
  Serial.begin(115200);
  Serial.println("\n\nDEBUG: He thong khoi dong...");
  
  pinMode(LED1_PIN, OUTPUT);
  pinMode(LED2_PIN, OUTPUT);
  pinMode(LED3_PIN, OUTPUT);
  pinMode(ANALOG_PIN, INPUT);
  
  digitalWrite(LED1_PIN, LOW);
  digitalWrite(LED2_PIN, LOW);
  digitalWrite(LED3_PIN, LOW);
  
  dht.begin();
  WiFi.mode(WIFI_STA);

  Serial.print("Dang ket noi WiFi: ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("\nDa ket noi WiFi!");
  Serial.print("Dia chi IP cua ESP32: ");
  Serial.println(WiFi.localIP());

  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  unsigned long currentMillis = millis();
  if (currentMillis - previousMillis >= interval) {
    previousMillis = currentMillis;
    readAndPublishSensors();
  }
}