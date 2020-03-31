const CONSTANT = require('../../constants');
const sqlite3 = require('sqlite3');

class UserDAO {

    /**
     * Data access object for User
     */

    constructor(){
        this.db = new sqlite3.Database(CONSTANT.DATABASE);
    }

    addUser(username, password, callback){
        /* Adds a new user to User. Returns true on success */
        const sql = `INSERT INTO User VALUES (?, ?)`;
        const params = [username, password];
        this.db.all(sql, params, function(err) {
            if (err) {
                callback(false);
            } else {
                callback(true);
            }
        });
    }

    checkCredentials(username, password, callback){
        /* Returns true if username exists, false otherwise */
        const sql = `SELECT * FROM User where username=?`;
        const params = [username];
        this.db.all(sql, params, function(err, rows) {
            if (err) {
                callback(false);
            } else {
                callback(rows.length === 1 && rows[0].password === password);
            }
        });
    }

	getEmail(username, callback){
		/* Returns the email of the user, null otherwise */
		const sql = `SELECT email FROM User where username=?`;
		const params = [username];
		this.db.all(sql, params, function(err, rows) {
            if (err) {
                callback(null);
                return;
            }
            callback(rows[0].email);
        });
	}
}

module.exports = UserDAO;