import asyncio
import time
from datetime import datetime

import requests
from supabase import create_client, Client

endpoint = "https://mljtamuxwaodtztzjvcu.supabase.co/functions/v1/button-press"
headers = {"Content-Type": "application/json",
           "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sanRhbXV4d2FvZHR6dHpqdmN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTgwMTEwNjYsImV4cCI6MjAxMzU4NzA2Nn0.wY3laMqSqrPxsgAGKu8lOw-H5K4ChxzDbkoZt-knJas"}
body = {"action": "start", "location": "paramount"}

# time.sleep(2)
print("going")

supabase: Client = create_client("https://mljtamuxwaodtztzjvcu.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sanRhbXV4d2FvZHR6dHpqdmN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTgwMTEwNjYsImV4cCI6MjAxMzU4NzA2Nn0.wY3laMqSqrPxsgAGKu8lOw-H5K4ChxzDbkoZt-knJas")
funcs = supabase.functions


async def test_func():
    return await funcs.invoke("button-press", invoke_options={'body': body})


try:
    # Send an HTTP request to the selected endpoint
    print("HTTP")
    a = datetime.now()
    response = requests.post(endpoint, headers=headers, json=body)
    if response.status_code == 200:
        b = datetime.now()
        print(b - a)
        print(response.json())
        print("HTTP request successful")
    else:
        print(f"HTTP request failed with status code {response.status_code}")

    time.sleep(2)
    print("SUPABASE")
    a = datetime.now()
    response = asyncio.run(test_func())
    b = datetime.now()
    print(b - a)
    print(response)

    # repeat this test 10 times to see how the time does

    for i in range(10):
        time.sleep(2)

        print("Try it with direct access to the record in the db")
        a = datetime.now()
        response = supabase.table("timers").select("*").eq("location", "paramount").single().execute()
        if response.data['isRunning']:
            print("It's running")
        else:
            print("It's not running")
        supabase.table("timers").update({"isRunning": True}).eq("location", "paramount").execute()
        b = datetime.now()
        print(b - a)

    # And then wait a minute to see if the connection is still alive
    print("Wait a minute")
    time.sleep(60)
    a = datetime.now()
    response = supabase.table("timers").select("*").eq("location", "paramount").single().execute()
    if response.data['isRunning']:
        print("It's running")
    else:
        print("It's not running")
    supabase.table("timers").update({"isRunning": True}).eq("location", "paramount").execute()
    b = datetime.now()
    print(b - a)

    print("Wait 2 minutes")
    time.sleep(120)
    a = datetime.now()
    response = supabase.table("timers").select("*").eq("location", "paramount").single().execute()
    if response.data['isRunning']:
        print("It's running")
    else:
        print("It's not running")
    supabase.table("timers").update({"isRunning": True}).eq("location", "paramount").execute()
    b = datetime.now()
    print(b - a)

    print("Wait 4 minutes")
    time.sleep(240)
    a = datetime.now()
    response = supabase.table("timers").select("*").eq("location", "paramount").single().execute()
    if response.data['isRunning']:
        print("It's running")
    else:
        print("It's not running")
    supabase.table("timers").update({"isRunning": True}).eq("location", "paramount").execute()
    b = datetime.now()
    print(b - a)

    # print("Faster")
    # a = datetime.now()
    # response = faster.post(endpoint, headers=headers, json=body)
    # b = datetime.now()
    # print(b - a)
    # print(response)
except Exception as e:
    print(f"An error occurred: {str(e)}")
