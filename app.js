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

		platform.handleException(errorCode);
	});

	console.log(data);
});

/*
 * Event to listen to in order to gracefully release all resources bound to this service.
 */
platform.on('close', function () {

	try {

		async.series([
			function (cb) {
				connection.shutdown();
				cb(null);
			},

			function (cb) {
				platform.notifyClose();
				cb(null);
			}

		], function (err, results) {
		});

	} catch (ex) {

		platform.handleException(ex);
	}



});

/*
 * Listen for the ready event.
 */
platform.once('ready', function (options) {

	var connection_options = {
		//certFile: __dirname + '/../../cert/cert.pem',
		//keyFile: __dirname + '/../../cert/key.pem'
		certData: options.certData,
		keyData: options.keyData
	};

	if (options.gateway)
		connection_options['gateway'] = options.gateway;

	if (options.passphrase)
		connection_options['passphrase'] = options.passphrase;

	if (options.port)
		connection_options['port'] = options.port;


	connection = apn.connection(connection_options);

	connection.on('connected', function () {
		platform.notifyReady();
	});

	connection.on('error', function (error) {
		platform.handleException(error);
	});

	connection.on('socketError', function (error) {
		platform.handleException(error);
	});

	connecrtion.on('cacheTooSmall', function (sizeDiff) {
		platform.handleException(sizeDiff);
	});



});