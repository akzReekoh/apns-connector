'use strict';

var _        = require('lodash'),
	apn      = require('apn'),
	platform = require('./platform'),
	connection;

/*
 * Listen for the data event.
 */
platform.on('data', function (data) {
	if (_.isEmpty(data.title))
		return platform.handleException(new Error('Missing data parameter: title'));

	if (_.isEmpty(data.body))
		return platform.handleException(new Error('Missing data parameter: message'));

	if (_.isEmpty(data.tokens) || !_.isArray(data.tokens))
		return platform.handleException(new Error('Invalid or missing data parameter: tokens. Should be a valid Array.'));

	var note = new apn.Notification();

	note.setAlertTitle(data.title);
	note.setAlertText(data.body);
	note.setBadge(1);

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
		platform.handleException(new Error('Notification caused error: ' + errorCode + ' for device ' + device + '. Notification: ' + notification));
	});

	connection.on('cacheTooSmall', function (sizeDiff) {
		platform.handleException(new Error('Error: Cache size is too small. Size diff: ' + sizeDiff));
	});

	connection.on('timeout', function () {
		platform.handleException(new Error('Connection timeout.'));
	});

	connection.on('disconnected', function () {
		platform.handleException(new Error('Disconnected from server.'));
	});

	connection.on('connected', function () {
		platform.log('APNS Connector initialized.');
		platform.notifyReady();
	});
});