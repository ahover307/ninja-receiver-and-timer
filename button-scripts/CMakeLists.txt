cmake_minimum_required(VERSION 3.26)
project(button_scripts C)

set(CMAKE_C_STANDARD 11)

find_package(CURL REQUIRED)

add_executable(button_scripts
        repeating_test.c
        single_test.c
        button.c)

include_directories(${CURL_INCLUDE_DIR})
target_link_libraries(button_scripts ${CURL_LIBRARIES})