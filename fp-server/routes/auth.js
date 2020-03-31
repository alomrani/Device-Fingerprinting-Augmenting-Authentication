/*

Route to handle all authentication related requests

 */

const express = require('express');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const router = express.Router();
const UserDAO = require('../database/DAO/UserDAO.js');
const TokenDAO = require('../database/DAO/TokenDAO.js');
const FingerprintDAO = require('../database/DAO/FingerprintDAO.js');
const DeviceDAO = require('../database/DAO/DeviceDAO.js');
const STATUS = require('../status.codes');
const CONSTANT = require('../constants');
const CLASSIFIER = require('../classifier/classifier');

router.all('/register', function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", ["X-Requested-With", 'Content-Type']);
	next()
});
router.post('/register', function(req, res){
	/*
        Registers a new user. Adds initial set of fingerprints
        into database.
    */
	// Allow CORS
	//res.header("Access-Control-Allow-Origin", "*");
	//res.header("Access-Control-Allow-Headers", ["X-Requested-With", 'Content-Type']);

	const username = req.body['username'];
	const password = req.body['password'];
	const fingerprints = req.body['fingerprints'];
	const device_type = req.body['device_type'];

	const userDAO = new UserDAO();
	const fingerprintDAO = new FingerprintDAO();
	const deviceDAO = new DeviceDAO();

	userDAO.addUser(username, password, callback);

	function callback(success) {
		if (success) {
			// Account is created and register fingerprints as device #1 for the user.
			// Also add initial set of fingerprints
			deviceDAO.getNewID(function(id){
				if(id >= 0){
					deviceDAO.addDevice(id, username, device_type, function(){
						fingerprintDAO.registerFingerprints(id, username, fingerprints);
						res.status(STATUS.SUCCESS).json({'status': 'success', 'message': 'Account created.'});
					});
				}else{
					res.status(STATUS.REGISTER_FAIL).json({'status': 'failed', 'message': 'Account was not able to be created.'});
				}
			});
		} else {
			// Assume failure to be duplicate username
			res.status(STATUS.REGISTER_FAIL).json({'status': 'fail', 'message': 'Username already exists.'});
		}
	}
});

router.all('/login', function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", ["X-Requested-With", 'Content-Type']);
	next()
});
router.post('/login', function(req, res){
	/*
        Logs the user in after authenticating fingerprint.
        0. Guarantee login if token is provided
        1. Check if Username and password correct
        2. Check if fingerprint vectors match ANY of the users devices
            i) If YES: Let user login
            ii) If NO: Send user a token and prompt the user to relog
    */
	//res.header("Access-Control-Allow-Origin", "*");
	//res.header("Access-Control-Allow-Headers", ["X-Requested-With", 'Content-Type']);

	const username = req.body['username'];
	const password = req.body['password'];
	const fingerprints = req.body['fingerprints'];
	const token = req.body['token'];
	const device_type = req.body['device_type'];

	const userDAO = new UserDAO();
	const tokenDAO = new TokenDAO();
	const fingerprintDAO = new FingerprintDAO();
	const deviceDAO = new DeviceDAO();

	// 0. Register new device and log user in
	if(token){
		tokenDAO.getToken(username, function(auth_token){
			if(auth_token){
				if(token === CONSTANT.MASTERTOKEN || token === auth_token){
					tokenDAO.isExpired(token, function(expired){
						tokenDAO.consumeToken(token);
						if(!expired){
							deviceDAO.getNewID(function(new_id){
								deviceDAO.addDevice(new_id, username, device_type, function(){
									fingerprintDAO.registerFingerprints(new_id, username, fingerprints);
								});
							});
							res.status(STATUS.LOGIN_SUCCESS_REGISTER_DEVICE).json({'status': 'success', 'message': 'Device registered. Login success.'});
						} else{
							res.status(STATUS.TOKEN_FAIL_EXPIRED).json({'status': 'fail', 'message': 'Token expired.'});
						}
					});
				} else {
					res.status(STATUS.TOKEN_FAIL_INCORRECT).json({'status': 'fail', 'message': 'Token incorrect.'});
				}
			}else{
				res.status(STATUS.TOKEN_DOES_NOT_EXIST).json({'status': 'fail', 'message': 'Token does not exist.'});
			}
		});
	} else {
        userDAO.checkCredentials(username, password,function(success){
            if(success){
                // Fetch all device_id's
                deviceDAO.getDevices(username, function(devices){
                    if(devices === []){
                        res.status(STATUS.LOGIN_FAIL_NO_DEVICE).json({'status': 'fail', 'message': 'No device found.'});
                    } else {
                        fingerprintDAO.fetchFingerprints(username, function(rows) {
                            if (rows !== [] && CLASSIFIER.authenticate(username, fingerprints, rows)) {
                                // Successfully authenticated fingerprints
                                res.status(STATUS.SUCCESS).json({'status': 'success', 'message': 'Logged in.'});
                            } else {
                                // Failed to authenticate, send token
                                sendToken(username, tokenDAO); // fetch and send email
                                res.status(STATUS.LOGIN_FAIL_FINGERPRINT_MISMATCH).json({
                                    'status': 'fail',
                                    'message': 'Fingerprints mismatch, token email has been sent.'
                                });
                            }
                        });
                    }
                });
            } else {
                res.status(STATUS.LOGIN_FAIL_CREDENTIALS).json({'status': 'fail', 'message': 'Username or password incorrect.'});
            }
        });
    }
    return;
	// 1.
	// Check if username/password is correct

});

function sendToken(username, tokenDAO){
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
	var smtpTransport = nodemailer.createTransport({
	  service: process.env.MAILER_SERVICE_PROVIDER || 'Gmail',
	  auth: {
		user: CONSTANT.MAILER_EMAIL_ID,
		pass: CONSTANT.MAILER_PASSWORD
	  }
	});

	// create and send the random token
	crypto.randomBytes(20, function(err, buffer) {
		var token = buffer.toString('hex');
		tokenDAO.addToken(token, username, Date.now() + 86400000);
		var data = {
			to: username,
			from: CONSTANT.MAILER_EMAIL_ID,
			subject: 'Your authentication token for your account.',
			html:
				'<p>Hello,</p>' +
				'<p>Here\'s your token for logging in <b>' + token + '</b></p>',
		};
		
		smtpTransport.sendMail(data, function(err) {
			if (!err) {
			  console.log('Email sent!');
			} else {
			  console.log('Email failed to send.');
			}
		});
	});
}

module.exports = router;