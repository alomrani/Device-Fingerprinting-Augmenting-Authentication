var express = require('express');
var router = express.Router();
var DeviceDAO = require('../database/DAO/DeviceDAO.js');
var UserDAO = require('../database/DAO/UserDAO.js');

router.all('/', function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Methods", "*");
	res.header("Access-Control-Allow-Headers", ["X-Requested-With", 'Content-Type']);
	next()
});

/* POST list of devices for a user. */
router.post('/', function(req, res) {
	var username = req.body.username;
	var password = req.body.password;
	
	let deviceDAO = new DeviceDAO();
	let userDAO = new UserDAO();
	userDAO.checkCredentials(username, password, function(result){
		if(result){
			deviceDAO.getDevices(username, function(devices){
				res.status(200).json(devices);
			});
		}else{
			res.status(400).json({'status': 'fail', 'message': 'Incorrect credentials.'})
		}
	});
});

router.all('/', function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Methods", "*");
	res.header("Access-Control-Allow-Headers", ["X-Requested-With", 'Content-Type']);
	next()
});
/* DELETE a device_id as long as the user owns it. */
router.delete('/', function(req, res) {
	var username = req.body.username;
	var password = req.body.password;
	var device_id = req.body.device_id;
	let deviceDAO = new DeviceDAO();
	let userDAO = new UserDAO();
	userDAO.checkCredentials(username, password, function(result){
		if(result){
			deviceDAO.relatedDevice(username, device_id, function(related){
				if(related){
					deviceDAO.removeDevice(device_id);
					res.status(200).json({'status': true, 'message': 'Device removed.'})
				}else{
					res.status(400).json({'status': false, 'message': 'Device was not removed.'})
				}
			});
		}else{
			res.status(400).json({'status': 'fail', 'message': 'Incorrect credentials.'})
		}
	});
});

module.exports = router;
