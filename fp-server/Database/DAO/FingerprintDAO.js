const CONSTANT = require('../../constants');
const sqlite3 = require('sqlite3');


class FingerprintDAO {

    /**
     * Data access object for Fingerprint
     */

    constructor(){
        this.db = this.db = new sqlite3.Database(CONSTANT.DATABASE);
    }

    registerFingerprints(device_id, username, fingerprints){
        /* Registers an initial set of fingerprints when user registers */
        for (const key in fingerprints) {
            if (fingerprints.hasOwnProperty(key)) {
                const sql = `INSERT INTO Fingerprint VALUES (?, ?, ?, ?)`;
                const params = [device_id, username, key, fingerprints[key].toString()];
                this.db.all(sql, params, function(err) {});
            }
        }
    }

    fetchFingerprints(username, callback){
        const sql = `SELECT * from Fingerprint WHERE username=?`;
        const params = [username];
        this.db.all(sql, params, function(err, rows) {
            if(err){
                callback(null)
            } else {
                callback(rows)
            }
        });
    }
}

module.exports = FingerprintDAO;