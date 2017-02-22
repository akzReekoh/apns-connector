'use strict'

let reekoh = require('reekoh')
let _plugin = new reekoh.plugins.Connector()
let apn = require('apn')
let async = require('async')
let isEmpty = require('lodash.isempty')
let isArray = require('lodash.isarray')
let isPlainObject = require('lodash.isplainobject')
let connection = null

let sendData = (data, callback) => {
  let d = require('domain').create()

  d.once('error', (error) => {
    callback(error)
    d.exit()
  })

  d.run(() => {
    if (isEmpty(data.title)) { callback(new Error('Missing data parameter: title')) }

    if (isEmpty(data.body)) { callback(new Error('Missing data parameter: message')) }

    if (isEmpty(data.tokens) || !isArray(data.tokens)) { callback(new Error('Invalid or missing data parameter: tokens. Should be a valid Array.')) }

    var note = new apn.Notification()

    note.setAlertTitle(data.title)
    note.setAlertText(data.body)
    note.setBadge(1)

    connection.pushNotification(note, data.tokens)
    callback()
  })
}

/**
 * Emitted when device data is received.
 * This is the event to listen to in order to get real-time data feed from the connected devices.
 * @param {object} data The data coming from the device represented as JSON Object.
 */
_plugin.on('data', (data) => {
  if (isPlainObject(data)) {
    sendData(data, (error) => {
      if (error) {
        console.error(error)
        _plugin.logException(error)
      }
    })
  } else if (isArray(data)) {
    async.each(data, (datum, done) => {
      sendData(datum, done)
    }, (error) => {
      if (error) {
        console.error(error)
        _plugin.logException(error)
      }
    })
  } else {
    _plugin.logException(new Error(`Invalid data received. Data must be a valid Array/JSON Object or a collection of objects. Data: ${data}`))
  }
})

/**
 * Emitted when the platform bootstraps the plugin. The plugin should listen once and execute its init process.
 */
_plugin.once('ready', () => {
  if (_plugin.config.production === null || _plugin.config.production === undefined || _plugin.config.production === '') _plugin.config.production = false

  connection = apn.connection(_plugin.config)

  connection.on('error', (error) => {
    _plugin.logException(error)
  })

  connection.on('socketError', (error) => {
    _plugin.logException(error)
  })

  connection.on('transmissionError', (errorCode, notification, device) => {
    _plugin.logException(new Error('Notification caused error: ' + errorCode + ' for device ' + device + '. Notification: ' + notification))
  })

  connection.on('cacheTooSmall', (sizeDiff) => {
    _plugin.logException(new Error('Error: Cache size is too small. Size diff: ' + sizeDiff))
  })

  connection.on('timeout', () => {
    _plugin.logException(new Error('Connection timeout.'))
  })

  connection.on('disconnected', () => {
    _plugin.logException(new Error('Disconnected from server.'))
  })

  connection.on('connected', () => {
    _plugin.log('APNS Connector has been initialized.')
  })
})
