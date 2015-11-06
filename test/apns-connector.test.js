'use strict';

var cp     = require('child_process'),
	should = require('should'),
	connector;
//NOTE
//This is commented as of the moment as this will produce an error because there is no valid APN cert and key yet.
//APNS account needs approval

//describe('Connector', function () {
//	this.slow(8000);
//
//	after('terminate child process', function () {
//		connector.send({
//			type: 'close'
//		});
//
//		setTimeout(function () {
//			connector.kill('SIGKILL');
//		}, 4000);
//	});
//
//	describe('#spawn', function () {
//		it('should spawn a child process', function () {
//			should.ok(connector = cp.fork(process.cwd()), 'Child process not spawned.');
//		});
//	});
//
//	describe('#handShake', function () {
//		it('should notify the parent process when ready within 8 seconds', function (done) {
//			this.timeout(8000);
//
//			connector.on('message', function (message) {
//				if (message.type === 'ready')
//					done();
//			});
//
//			connector.send({
//				type: 'ready',
//				data: {
//					options: {
//						production: 'false'
//					}
//				}
//			}, function (error) {
//				should.ifError(error);
//			});
//		});
//	});
//
//	describe('#data', function (done) {
//		it('should process the data', function () {
//			var currentdate = new Date();
//			var message = 'Last Sync: ' + currentdate.getDate() + '/'
//				+ (currentdate.getMonth()+1)  + '/'
//				+ currentdate.getFullYear() + ' @ '
//				+ currentdate.getHours() + ':'
//				+ currentdate.getMinutes() + ':'
//				+ currentdate.getSeconds();
//
//
//			connector.send({
//				type: 'data',
//				data: {
//					tokens: ['1234', '4321'],
//					msg: message
//				}
//			}, done);
//		});
//	});
//});
