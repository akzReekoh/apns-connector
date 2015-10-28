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

	console.log(data);
});

/*
 * Event to listen to in order to gracefully release all resources bound to this service.
 */
platform.on('close', function () {

	async.series([
			function (cb) {
				connection.shutdown();
				cb(null);
			},

		    function(cb) {
				platform.notifyClose();
				cb(null);
			}

		], function (err, results) {});
});

/*
 * Listen for the ready event.
 */
platform.once('ready', function (options) {


	var connection_options = {
		cert: __dirname + '/../../cert/cert.pem',
		key: __dirname + '/../../cert/key.pem'
	};

	if (options.gateway)
		connection_options['gateway'] = options.gateway;

	if (options.passphrase)
		connection_options['passphrase'] = options.passphrase;

	if (options.port)
		connection_options['port'] = options.port;


	connection = apn.connection(connection_options);

	console.log(options);
	platform.notifyReady();
});