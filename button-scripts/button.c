#include <pigpio.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <curl/curl.h>

const int button_pin = 17; // GPIO 17
const int switch_pin = 18; // GPIO 18
const int led_pin = 23;    // GPIO 23
const int buzzer_pin = 24; // GPIO 24

const char* endpoint = "https://mljtamuxwaodtztzjvcu.supabase.co/functions/v1/button-press";
const char* body;

CURL *curl;
CURLcode res;
struct curl_slist *headers = NULL;

void button_callback(int gpio, int level, uint32_t tick) {
    if (level == 1) {
        // The switch was released, turn the LED back on
        gpioWrite(led_pin, 1);
    } else {
        // The button was pressed,
        // Disable the led
        gpioWrite(led_pin, 0);

        // check the switch
        int switch_state = gpioRead(switch_pin);
        if (switch_state == 1) {
            printf("Starting\n");
            body = "{\"action\": \"start\", \"location\": \"paramount\"}";
        } else {
            printf("Stopping\n");
            body = "{\"action\": \"stop\", \"location\": \"paramount\"}";
        }

        // Make a curl request
        curl_easy_setopt(curl, CURLOPT_POSTFIELDS, body);
        res = curl_easy_perform(curl);
        if (res != CURLE_OK) {
            fprintf(stderr, "curl_easy_perform() failed: %s\n", curl_easy_strerror(res));
        } else {
            printf("HTTP request successful\n");
        }

    }
}


int main(void) {
    headers = curl_slist_append(headers, "Content-Type: application/json");
    headers = curl_slist_append(headers, "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sanRhbXV4d2FvZHR6dHpqdmN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTgwMTEwNjYsImV4cCI6MjAxMzU4NzA2Nn0.wY3laMqSqrPxsgAGKu8lOw-H5K4ChxzDbkoZt-knJas");

    // Initialize libcurl
    curl_global_init(CURL_GLOBAL_DEFAULT);
    curl = curl_easy_init();

    // Initialize Curl
    if (curl)
    {
        curl_easy_setopt(curl, CURLOPT_URL, endpoint);
        curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);

        // Initilize GPIO
        if (gpioInitialise() < 0)
        {
            // If it failed to initialize, exit
            return -1;
        }

        gpioSetMode(button_pin, PI_INPUT);
        gpioSetMode(switch_pin, PI_INPUT);
        gpioSetMode(led_pin, PI_OUTPUT);
        gpioSetMode(buzzer_pin, PI_OUTPUT);

        // Set a small debounce on the button
        gpioSetGlitchFilter(button_pin, 200000);

        // Blink the light to show that the program is booting
        gpioWrite(led_pin, 1);
        sleep(0.5);
        gpioWrite(led_pin, 0);
        sleep(0.5);
        gpioWrite(led_pin, 1);
        sleep(0.5);
        gpioWrite(led_pin, 0);
        sleep(0.5);
        gpioWrite(led_pin, 1);

        // Set up the button callback
        gpioSetAlertFunc(button_pin, button_callback);
    } else {
        fprintf(stderr, "curl_easy_init() failed\n");
    }

    return 0;
}
