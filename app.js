'use strict';

var apn      = require('apn'),
	isEmpty  = require('lodash.isempty'),
	isArray  = require('lodash.isarray'),
	isPlainObject = require('lodash.isplainobject'),
	async = require(async),
	platform = require('./platform'),
	connection;

let sendData = (data) => {
	if (isEmpty(data.title))
		return platform.handleException(new Error('Missing data parameter: title'));

	if (isEmpty(data.body))
		return platform.handleException(new Error('Missing data parameter: message'));

	if (isEmpty(data.tokens) || !isArray(data.tokens))
		return platform.handleException(new Error('Invalid or missing data parameter: tokens. Should be a valid Array.'));

	var note = new apn.Notification();

	note.setAlertTitle(data.title);
	note.setAlertText(data.body);
	note.setBadge(1);

	connection.pushNotification(note, data.tokens);
};

platform.on('data', function (data) {
	if(isPlainObject(data)){
		sendData(data);
	}
	else if(isArray(data)){
		async.each(data, (datum) => {
			sendData(datum);
		});
	}
	else
		platform.handleException(new Error(`Invalid data received. Data must be a valid Array/JSON Object or a collection of objects. Data: ${data}`));
});

platform.on('close', function () {
	var domain = require('domain');
	var d = domain.create();

	d.once('error', function (error) {
		platform.handleException(error);
		platform.notifyClose();
		d.exit();
	});

	d.run(function () {
		connection.shutdown();
		platform.notifyClose();
		d.exit();
	});
});

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