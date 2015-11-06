'use strict';

var platform = require('./platform'),
	apn = require('apn'),
	async = require('async'),
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

	connection.on('error', function (error) {
		platform.handleException(error);
	});

	connection.on('socketError', function (error) {
		platform.handleException(error);
	});

	connection.on('transmissionError', function (errorCode, notification, device) {

		platform.handleException(new Error('Error: ' + errorCode + ' Notification: ' + notification + ' Device: ' + device));

	});

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

	var connection_options = {
		cer: options.certData,
		key: options.keyData
	};

    if (options.ca)
	   connection_options.ca = options.ca;

	if (options.passphrase)
		connection_options.passphrase = options.passphrase;

	if (options.port)
		connection_options.port = options.port;

	connection = apn.connection(connection_options);

	connection.on('connected', function () {
		platform.log('APNS Connector has initialized');
		platform.notifyReady();
	});

	connection.on('error', function (error) {
		platform.handleException(error);
	});

	connection.on('socketError', function (error) {
		platform.handleException(error);
	});

	connecrtion.on('cacheTooSmall', function (sizeDiff) {
		platform.handleException(new Error('Error: Cache size is too small'));
	});



});