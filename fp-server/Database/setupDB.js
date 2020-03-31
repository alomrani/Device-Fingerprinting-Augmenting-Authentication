const CONSTANT = require('../constants');
const sqlite3 = require('sqlite3');
let db = new sqlite3.Database(CONSTANT.DATABASE);

/*
	Script to remake database.
*/

const deleteTableUser = `DROP TABLE IF EXISTS User;`;
const deleteTableDevice = `DROP TABLE IF EXISTS Device;`;
const deleteTableFingerprint = `DROP TABLE IF EXISTS Fingerprint;`;
const deleteTableToken = `DROP TABLE IF EXISTS Token;`;

const createTableUser = `CREATE TABLE IF NOT EXISTS User (
        username VARCHAR(50) PRIMARY KEY NOT NULL,
	    password VARCHAR(32) NOT NULL
	);`;
const createTableFingerprint = `CREATE TABLE IF NOT EXISTS Fingerprint (
	    device_id INTEGER NOT NULL,
	    username INTEGER NOT NULL,
	    fingerprint_name VARCHAR NOT NULL,
	    fingerprint_data VARCHAR NOT NULL,
	    FOREIGN KEY (username) REFERENCES User (username),
	    FOREIGN KEY (device_id) REFERENCES Device (device_id)
	);`;
const createTableDevice = `	
	CREATE TABLE IF NOT EXISTS Device (
        device_id INT,
		username VARCHAR(20) NOT NULL,
		device_type VARCHAR(10) NOT NULL,
		FOREIGN KEY (username) REFERENCES User (username)
	);`;
const createTableToken = `
	CREATE TABLE IF NOT EXISTS Token (
		token VARCHAR(20),
		username VARCHAR(20) NOT NULL,
		expiration INTEGER NOT NULL,
		FOREIGN KEY (username) REFERENCES User (username)
	);`;

// Delete Tables
db.all(deleteTableUser, function() {
	db.all(deleteTableDevice, function() {
		db.all(deleteTableFingerprint, function() {
			db.all(deleteTableToken, function() {

				// Create Tables
				db.all(createTableUser, function() {
					db.all(createTableFingerprint, function() {
						db.all(createTableDevice, function() {
							db.all(createTableToken, function() {
							});
						});
					});
				});
			});
		});
	});
});