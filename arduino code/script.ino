#include <SPI.h>
#include <RF24.h>

RF24 radio(9, 10);
const int buttonPin = 2;
const int rockerPin = 3;

void setup() {
  // Set up both inputs as attached to a ground
  pinMode(buttonPin, INPUT_PULLUP);
  pinMode(rockerPin, INPUT_PULLUP);

  // Initialize the items
  Serial.begin(9600);
  radio.begin();


  radio.enableDynamicPayloads();
  radio.openWritingPipe(0xF0F0F0F0D2LL);
}

void loop() {
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

    delay(1000);
  }
}
