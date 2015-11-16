'use strict';

var apn      = require('apn'),
	platform = require('./platform'),
	connection;

/*
 * Listen for the data event.
 */
platform.on('data', function (data) {
	var note = new apn.notification();
	note.setAlertText(data.msg);
	note.badge = 1;

	//NOTE:
	//a single token or an array of tokens can be passed
	//data.token = single device ID
	//data.tokens = array of device IDs
	connection.pushNotification(note, data.tokens);
});

/*
 * Event to listen to in order to gracefully release all resources bound to this service.
 */
platform.on('close', function () {
	var domain = require('domain');
	var d = domain.create();

	d.on('error', function (error) {
		platform.handleException(error);
		platform.notifyClose();
	});

	d.run(function () {
		connection.shutdown();
		platform.notifyClose();
	});
});

/*
 * Listen for the ready event.
 */
platform.once('ready', function (options) {
	if (options.production === null || options.production === undefined || options.production === '')
		options.production = false;

	connection = apn.connection(options);

	connection.on('error', function (error) {
		platform.handleException(error);
	});

	connection.on('socketError', function (error) {
		platform.handleException(error);
	});

	connection.on('transmissionError', function (errorCode, notification, device) {
		platform.handleException(new Error('Error: ' + errorCode + ' Notification: ' + notification + ' Device: ' + device));
	});

	connection.on('cacheTooSmall', function (sizeDiff) {
		platform.handleException(new Error('Error: Cache size is too small. Size diff: ' + sizeDiff));
	});

	connection.on('connected', function () {
		platform.log('APNS Connector has initialized');
		platform.notifyReady();
	});
});