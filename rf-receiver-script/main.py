import argparse
from datetime import datetime
import struct
import sys
import time
import traceback

import pigpio
import requests
from nrf24 import *

# address = 0xF0F0F0F0D2
address = 120

#
# A simple NRF24L receiver that connects to a PIGPIO instance on a hostname and port, default "localhost" and 8888, and
# starts receiving data on the two addresses. The first address used a fixed payload size, and the second address uses
# a dynamic payload size.
# Use the companion program "mixed-sender.py" to send data to it from a different Raspberry Pi.
#
if __name__ == "__main__":
    # Connect to pigpiod
    print('Connecting to GPIO daemon')
    pi = pigpio.pi()
    if not pi.connected:
        print("Not connected to Raspberry Pi ... goodbye.")
        sys.exit()

    # Create NRF24 object.
    nrf = NRF24(pi, ce=25, pa_level=RF24_PA.LOW)
    nrf.set_payload_size(RF24_PAYLOAD.DYNAMIC)

    print("Opening reading pipe")
    nrf.open_reading_pipe(RF24_RX_ADDR.P1, address)

    # Display the content of NRF24L01 device registers.
    # nrf.show_registers()

    # Enter a loop receiving data on the address specified.
    try:
        print('Ready to receive messages')
        while True:
            # As long as data is ready for processing, process it.
            while nrf.data_ready():
                # Read pipe and payload for message.
                payload: bytearray = nrf.get_payload()
                payload = payload.rstrip(b'\x00')
                s = payload.decode('utf-8')

                if s == 'START':
                    print('Starting timer')
                    x = requests.post('http://localhost:3000/startTimer', headers={'apikey': 'ucCsHJeM!QqhS2dZH!P3h8A49ocS7&wRzD9%Y9yXTx!Xf4Kegiw6JmHuXnWncZR5!7qXmG'})
                    print(x.status_code)
                elif s == 'END':
                    print('Stopping timer')
                    x = requests.post('http://localhost:3000/stopTimer', headers={'apikey': 'ucCsHJeM!QqhS2dZH!P3h8A49ocS7&wRzD9%Y9yXTx!Xf4Kegiw6JmHuXnWncZR5!7qXmG'})
                    print(x.status_code)
                else:
                    print('Unknown message received')
                    print(s)

                print("finished loop, waiting for next input")
            # Sleep 100 ms.
            time.sleep(0.1)
    except:
        traceback.print_exc()
        nrf.power_down()
        pi.spi_close(nrf.get_spi_handle())
        pi.stop()
        print("Bye")
