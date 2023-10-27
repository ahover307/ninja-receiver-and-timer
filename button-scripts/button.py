from time import sleep
from datetime import datetime, timezone

import RPi.GPIO as GPIO
from supabase import Client, create_client

# TODO Set up audio output
# https://peppe8o.com/use-passive-buzzer-with-raspberry-pi-and-python/

# Setup GPIO mode and pins
GPIO.setmode(GPIO.BCM)
button_pin = 17
switch_pin = 18
led_pin = 23
buzzer_pin = 24 # TODO

button_depressed = False

# Set up Supabase client
supabase: Client = create_client("https://mljtamuxwaodtztzjvcu.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sanRhbXV4d2FvZHR6dHpqdmN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTgwMTEwNjYsImV4cCI6MjAxMzU4NzA2Nn0.wY3laMqSqrPxsgAGKu8lOw-H5K4ChxzDbkoZt-knJas")

# Set up the button pin as an input with a pull-up resistor
GPIO.setup(button_pin, GPIO.IN, pull_up_down=GPIO.PUD_UP)

# Set up the switch pin as an input with a pull-up resistor
GPIO.setup(switch_pin, GPIO.IN, pull_up_down=GPIO.PUD_UP)

# Set up the LED pin as an output
GPIO.setup(led_pin, GPIO.OUT)


def blink_led(repetitions=3, leave_on=False, sleep_main_thread=True):
    # Blink the LED
    def internal_blink():
        for i in range(repetitions):
            GPIO.output(led_pin, GPIO.HIGH)
            sleep(0.5)
            GPIO.output(led_pin, GPIO.LOW)
            sleep(0.5)

        if leave_on:
            GPIO.output(led_pin, GPIO.HIGH)

    if sleep_main_thread:
        internal_blink()
    else:
        # Run the blink in a new thread
        import threading
        t = threading.Thread(target=internal_blink)
        t.start()
        return t


def play_buzzer(repetitions=3, positive=True, sleep_main_thread=True):
    # TODO
    pass


def button_and_sound(repetitions=3, positive=True):
    lights = blink_led(repetitions, positive, False)
    sound = play_buzzer(repetitions, positive, False)

    lights.join()
    # sound.join() TODO


def handle_error(e):
    print(f"An error occurred: {str(e)}")
    if e.status_code == 502:
        button_and_sound(5, False)
    else:
        button_and_sound(2, False)


def button_callback(channel):
    global button_depressed
    if not button_depressed:
        print("Button pressed")

        # Turn off the LED
        GPIO.output(led_pin, GPIO.LOW)

        # Determine which endpoint to call based on the switch state
        switch_state = GPIO.input(switch_pin)
        set_to_start = True

        if switch_state == GPIO.HIGH:
            # Switch is turned off
            print("Starting")
            set_to_start = True
        else:
            print("Stopping")
            set_to_start = False

        a = datetime.now()
        response = supabase.table("timers").select("*").eq("location", "paramount").single().execute()
        if response.data['isRunning']:
            print("It's running")
            if set_to_start:
                # If the timer is already running, stop the timer, and clear the times
                print("Clearing the running timer")
                supabase.table("timers").update({"isRunning": False, "startTime": None, "endTime": None}).eq("location", "paramount").execute()
            else:
                # If we are stopping the timer, then keep the times, just stop the timer
                print("Stopping the running timer")
                supabase.table("timers").update({"isRunning": False, "endTime": datetime.now(timezone.utc)}).eq("location", "paramount").execute()
        else:
            if set_to_start:
                # If the timer is not running, start the timer, and set the start time
                print("Starting the stopped timer")
                supabase.table("timers").update({"isRunning": True, "startTime": datetime.now(timezone.utc)}).eq("location", "paramount").execute()
            else:
                # If we are stopping the timer, the timer here, we don't really need to do anything
                print("The timer is already stopped")
                pass
        b = datetime.now()
        print(b - a)

        button_depressed = True
    else:
        print("Button released")
        button_depressed = False
        GPIO.output(led_pin, GPIO.LOW)



# Add an event listener for the button press
GPIO.add_event_detect(button_pin, GPIO.BOTH, callback=button_callback, bouncetime=200)

try:
    # Blink then turn on the LED initially
    blink_led(3, True)

    # Your main program loop here
    while True:
        pass

except KeyboardInterrupt:
    pass

# Clean up GPIO configuration
GPIO.cleanup()
