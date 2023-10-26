#include <stdio.h>
#include <string.h>
#include <sys/time.h>
#include <curl/curl.h>
#include <unistd.h>  // for sleep

int main(void) {
    CURL *curl;
    CURLcode res;
    struct timeval start_time, end_time;

    // Endpoint URL and request body
    const char *endpoint = "https://mljtamuxwaodtztzjvcu.supabase.co/functions/v1/button-press";
    const char *body = "{\"action\": \"start\", \"location\": \"paramount\"}";

    // HTTP headers
    struct curl_slist *headers = NULL;
    headers = curl_slist_append(headers, "Content-Type: application/json");
    headers = curl_slist_append(headers, "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sanRhbXV4d2FvZHR6dHpqdmN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTgwMTEwNjYsImV4cCI6MjAxMzU4NzA2Nn0.wY3laMqSqrPxsgAGKu8lOw-H5K4ChxzDbkoZt-knJas");

    // Number of iterations
    int num_iterations = 10; // Adjust this as needed

    // Initialize libcurl
    curl_global_init(CURL_GLOBAL_DEFAULT);
    curl = curl_easy_init();

    if (curl) {
        for (int i = 0; i < num_iterations; i++) {
            // Set the endpoint URL
            curl_easy_setopt(curl, CURLOPT_URL, endpoint);

            // Set the HTTP headers
            curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);

            // Set the request body
            curl_easy_setopt(curl, CURLOPT_POSTFIELDS, body);

            // Capture the start time
            gettimeofday(&start_time, NULL);

            // Perform the HTTP POST request
            res = curl_easy_perform(curl);

            // Capture the end time
            gettimeofday(&end_time, NULL);

            // Check for errors
            if (res != CURLE_OK) {
                fprintf(stderr, "curl_easy_perform() failed: %s\n", curl_easy_strerror(res));
            } else {
                printf("HTTP request successful\n");

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

            // Delay for approximately 1 second
            sleep(1);
        }

        // Clean up
        curl_easy_cleanup(curl);
        curl_global_cleanup();
    } else {
        fprintf(stderr, "curl_easy_init() failed\n");
    }

    return 0;
}
