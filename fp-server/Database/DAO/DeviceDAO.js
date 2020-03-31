const CONSTANT = require('../../constants');
const sqlite3 = require('sqlite3');


class DeviceDAO {

    /**
     * Data access object for Device
	 * @param db: Database connection
     */

    constructor(){
        this.db = new sqlite3.Database(CONSTANT.DATABASE);
    }

    addDevice(device_id, username, device_type, callback){
        /* Adds a new device. Returns true on success */
        const sql = `INSERT INTO Device VALUES (?, ?, ?)`;
        const params = [device_id, username, device_type];
        this.db.all(sql, params, function(err, rows) {
            if(err){
                callback(-1);
            } else {
                callback(device_id);
            }
        });
    }

    getDevices(username, callback){
        /* Returns a list of valid device_id's on file for user */
        const sql = `SELECT device_id from Device WHERE username=?`;
        const params = [username];
        this.db.all(sql, params, function(err, rows) {
            if(err){
                callback([]);
            } else {
                let devices = [];
                for(let i = 0; i < rows.length; i++){
                    devices.push(rows[i]['device_id']);
                }
                callback(devices);
            }
        });
    }

    getMaxDevice(username, callback){
        /* Get new device_id for username */
        const sql = `SELECT MAX(device_id) as val from Device WHERE username = ?`;
        const params = [username];
        this.db.all(sql, params, function(err, rows) {
            if(err){
                callback(-1)
            } else {
                callback(rows[0]['val'] + 1)
            }
        });
    }
	
	getNewID(callback){
        /* Get new device_id for username */
        const sql = `SELECT MAX(device_id) as val from Device`;
        this.db.all(sql, function(err, rows) {
            if(err){
                callback(-1)
            } else {
                callback(rows[0]['val'] + 1)
            }
        });
    }
	
	relatedDevice(username, device_id, callback){
        /* Returns a list of valid device_id's on file for user */
        const sql = `SELECT username from Device WHERE device_id=?`;
        const params = [device_id];
        this.db.all(sql, params, function(err, rows) {
            if(err){
                callback(false)
            } else {
                callback(rows && username === rows[0].username)
            }
        });
    }
	
	removeDevice(device_id){
		/* Removes device from database */
        var sql = `DELETE FROM Fingerprint where device_id=?`;
        const params = [device_id];

        this.db.all(sql, params, function(err) {});

        sql = `DELETE FROM Device where device_id=?`;

        this.db.all(sql, params, function(err) {});
    }
}

module.exports = DeviceDAO;