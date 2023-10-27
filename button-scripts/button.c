#include <stdio.h>
#include <pigpio.h>
#include <pthread.h>
#include <stdlib.h>
#include <sys/time.h>
#include <unistd.h>
#include <signal.h>
#include <curl/curl.h>

const int button_pin = 17; // GPIO 17
const int switch_pin = 18; // GPIO 18
const int led_pin = 23;    // GPIO 23
const int buzzer_pin = 24; // GPIO 24

const char *button_endpoint = "https://mljtamuxwaodtztzjvcu.supabase.co/functions/v1/button-press";
const char *body;

CURL *curl;
CURLcode res;
struct curl_slist *headers = NULL;

int switch_state = 0;
struct timeval start_time, end_time;

// Define a mutex to protect the shared variable
pthread_mutex_t mutex = PTHREAD_MUTEX_INITIALIZER;

void keepAliveCallback() {
    if (curl) {
        pthread_mutex_lock(&mutex);

        body = "{\"action\": \"keepAlive\", \"location\": \"paramount\"}";
        curl_easy_setopt(curl, CURLOPT_POSTFIELDS, body);
        res = curl_easy_perform(curl);

        if (res != CURLE_OK) {
            fprintf(stderr, "curl_easy_perform() failed: %s\n", curl_easy_strerror(res));
        } else {
            printf("Keep alive request successful\n");
        }

        pthread_mutex_unlock(&mutex);
    }
}

void *backgroundThreadToKeepAlive(void *arg) {
    while (1) {
        keepAliveCallback();
        sleep(90);
    }

    return NULL;
}

void handle_ctrl_c(int signal) {
    printf("Ctrl+C pressed. Exiting...\n");

    // Clean up
    curl_easy_cleanup(curl);
    curl_global_cleanup();

    pthread_mutex_destroy(&mutex);

    gpioTerminate();

    exit(0);
}

void switch_callback(int gpio, int level, uint32_t tick) {
    // The switch was flipped
    printf("Switch flipped\n");
    // Check the switch
    switch_state = level;
}

void button_callback(int gpio, int level, uint32_t tick) {
    if (level == 1) {
        // The button was released,
        printf("Button released\n");
        gpioWrite(led_pin, 1);
    } else {
        gettimeofday(&start_time, NULL);

        // The button was pressed
        printf("Button pressed - ");
        gpioWrite(led_pin, 0);

        pthread_mutex_lock(&mutex);

        // check the switch
        if (switch_state == 1) {
            printf("Starting - ");
            body = "{\"action\": \"start\", \"location\": \"paramount\"}";
        } else {
            printf("Stopping - ");
            body = "{\"action\": \"stop\", \"location\": \"paramount\"}";
        }

        printf("Sending HTTP request - ");

        // Make a curl request
        curl_easy_setopt(curl, CURLOPT_POSTFIELDS, body);
        res = curl_easy_perform(curl);

        gettimeofday(&end_time, NULL);

        if (res != CURLE_OK) {
            fprintf(stderr, " curl_easy_perform() failed: %s\n", curl_easy_strerror(res));
        } else {
            printf(" HTTP request successful\n");
        }

        pthread_mutex_unlock(&mutex);

        // Calculate the duration in milliseconds
        long long start_msec = (start_time.tv_sec * 1000) + (start_time.tv_usec / 1000);
        long long end_msec = (end_time.tv_sec * 1000) + (end_time.tv_usec / 1000);
        long long duration = end_msec - start_msec;

        // Format and print the duration as "00:00.0000"
        long minutes = duration / (60 * 1000);
        long seconds = (duration % (60 * 1000)) / 1000;
        long milliseconds = duration % 1000;
        printf("Duration: %02ld:%02ld.%04ld\n", minutes, seconds, milliseconds);
    }
}


int main() {
    printf("Starting\n");

    headers = curl_slist_append(headers, "Content-Type: application/json");
    headers = curl_slist_append(headers,
                                "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sanRhbXV4d2FvZHR6dHpqdmN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTgwMTEwNjYsImV4cCI6MjAxMzU4NzA2Nn0.wY3laMqSqrPxsgAGKu8lOw-H5K4ChxzDbkoZt-knJas");

    // Initialize libcurl
    curl_global_init(CURL_GLOBAL_DEFAULT);
    curl = curl_easy_init();

    // Initialize Curl
    if (curl) {
        // Make a keep alive request to wake up the functions
        curl_easy_setopt(curl, CURLOPT_URL, button_endpoint);
        curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);


        // Start a background thread to keep the functions awake
        pthread_t thread_id;
        if (pthread_create(&thread_id, NULL, backgroundThreadToKeepAlive, NULL) != 0) {
            printf("Failed to create thread\n");
            return 1;
        }

        // Register exit
        signal(SIGINT, handle_ctrl_c);


        printf("Setting up GPIO\n");
        // Initilize GPIO
        if (gpioInitialise() < 0) {
            // If it failed to initialize, exit
            return -1;
        }

        gpioSetMode(button_pin, PI_INPUT);
        gpioSetMode(switch_pin, PI_INPUT);
        gpioSetPullUpDown(button_pin, PI_PUD_UP);
        gpioSetPullUpDown(switch_pin, PI_PUD_UP);

        gpioSetMode(led_pin, PI_OUTPUT);
//        gpioSetMode(buzzer_pin, PI_OUTPUT);

        // Set a small debounce on the button
        gpioGlitchFilter(button_pin, 5000);
        gpioGlitchFilter(switch_pin, 10000);

        // Get initial state of the switch
        switch_state = gpioRead(switch_pin);

        printf("Blinking LED\n");
        // Blink the light to show that the program is booting
        gpioWrite(led_pin, 1);
        sleep(1);
        gpioWrite(led_pin, 0);
        sleep(1);
        gpioWrite(led_pin, 1);
        sleep(1);
        gpioWrite(led_pin, 0);
        sleep(1);
        gpioWrite(led_pin, 1);

        // Set up the button callback
        printf("Setting up callbacks\n");
        gpioSetAlertFunc(button_pin, button_callback);
        gpioSetAlertFunc(switch_pin, switch_callback);

        printf("And we're off!\n");

        while (1) { /* Keep program alive */ }
    } else {
        fprintf(stderr, "curl_easy_init() failed\n");
    }

    return 0;
}
