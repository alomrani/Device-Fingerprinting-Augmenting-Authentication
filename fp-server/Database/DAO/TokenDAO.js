const CONSTANT = require('../../constants');
const sqlite3 = require('sqlite3');

class TokenDAO {

    /**
     * Data access object for Device
     * @param db: Database connection
     */

    constructor(){
        this.db = new sqlite3.Database(CONSTANT.DATABASE);
    }

    addToken(token, username, expiration){
		/* Adds a new token to a user, returns true on success */
        const sql = `INSERT INTO Token VALUES (?, ?, ?)`;
        const params = [token, username, expiration];

        this.db.all(sql, params, function(err) {});
    }
	
	getToken(username, callback){
		/* Returns the token associated with the username, null otherwise */
		const sql = `SELECT token FROM Token where username=?`;
		const params = [username];
		this.db.all(sql, params, function(err, rows) {
            if (err) {
                callback(null);
                return;
            }
            callback(rows[0].token);
        });
	}

    consumeToken(token){
		/* Removes token from database, returns true if success */
        const sql = `DELETE FROM Token where token=?`;
        const params = [token];

        this.db.all(sql, params, function(err) {});
    }
	
	isExpired(token, callback){
		/* Returns whether the token has expired or not */
		const sql = `SELECT expiration FROM Token where token=?`;
		const params = [token];
		this.db.all(sql, params, function(err, rows) {
            if (err) {
                callback(false);
                return;
            }
            callback(Date.now() > rows[0].expiration);
        });
	}

}

module.exports = TokenDAO;