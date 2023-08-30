#include <SPI.h>
#include <RF24.h>

RF24 radio(9, 10);
const int buttonPin = 2;
const int rockerPin = 3;
const int buttonLEDPin = 4;

unsigned long previousMillis = 0;
const int debounceMillis = 1000;

void setup() {
  // Set up both inputs as attached to a ground
  pinMode(buttonPin, INPUT_PULLUP);
  pinMode(rockerPin, INPUT_PULLUP);
  pinMode(buttonLEDPin, OUTPUT);

  // Initialize the items
  Serial.begin(9600);
  radio.begin();

  radio.enableDynamicPayloads();
  radio.setPALevel(RF24_PA_MAX); // Set maximum power (The faa cant stop me)
  radio.openWritingPipe(0xF0F0F0F0D2LL);

  // Flash the button LED on launch
  digitalWrite(buttonLEDPin, HIGH);
  delay(500);
  digitalWrite(buttonLEDPin, LOW);
  delay(500);
  digitalWrite(buttonLEDPin, HIGH);
  delay(500);
  digitalWrite(buttonLEDPin, LOW);
  delay(500);
  digitalWrite(buttonLEDPin, HIGH);
}

void loop() {
  // We avoid using the in-built "delay()" command as we don't want to sleep this main thread here.
  // Limitation of a single threaded device. Instead we are going to count intervals so that our led listener can continue to run
  // Millis() will wrap when it goes past the given time, so that is why we are comparing to if the number got smaller
  unsigned long currentMillis = millis();

  // Technically that means we will have the possibility of a debounce that is longer than intended once every 49 days, but I think that is a non-issue for us
  if (currentMillis - previousMillis >= debounceMillis || (currentMillis < previousMillis && currentMillis > debounceMillis)) {
    if (digitalRead(buttonPin) == LOW) { // When button is pressed, the charge will clear
      if (digitalRead(rockerPin) == HIGH) { // if rocker is set to OFF, Transmit "START"
        Serial.println("sending START signal");

        char dataToSend[] = "START";
        radio.write(&dataToSend, sizeof(dataToSend));
      } else  {
        Serial.println("sending END signal");

        char dataToSend[] = "END";
        radio.write(&dataToSend, sizeof(dataToSend));
      }

      // Track that the button was pressed, pull in the previous item
      previousMillis = currentMillis;
    }
  }

  // Light up the light when the button is sleeping, or disable light when it is pressed
  // ChatGPT assures me that arduino is smart enough to compare the current value to future value
  // and this will not have any effect on the life of the pins.
  if (digitalRead(buttonPin) == LOW) {
    digitalWrite(buttonLEDPin, LOW);
  } else {
    digitalWrite(buttonLEDPin, HIGH);
  }
}
