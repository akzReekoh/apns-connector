# APNS Connector

[![Build Status](https://travis-ci.org/Reekoh/apns-connector.svg)](https://travis-ci.org/Reekoh/apns-connector)
![Dependencies](https://img.shields.io/david/Reekoh/apns-connector.svg)
![Dependencies](https://img.shields.io/david/dev/Reekoh/apns-connector.svg)
![Built With](https://img.shields.io/badge/built%20with-gulp-red.svg)

Apple Push Notifications Service (APNS) Connector Plugin for the Reekoh IoT Platform. Integrates a Reekoh Instance with APNS to send push notifications to mobile devices.

Uses [apn](https://github.com/argon/node-apn) library.

## Input Data

* title (String) - A short string describing the purpose of the notification.
* body (String) - The text of the alert message.
* tokens ([String]) - An array of device tokens (String) to send the notification to. 
