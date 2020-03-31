const CONSTANT = require('./../constants');

module.exports = {

    authenticate: function (username, login_fingerprints, rows) {

        let map = {};
        for(let i = 0; i < rows.length; i++){
            const key = rows[i]['device_id'];
                if(!(key in map)){
                    map[key] = {};
                    map[key]['fingerprints'] = {}
                }
                const fingerprint_name = rows[i]['fingerprint_name'];
                map[key]['fingerprints'][fingerprint_name] = rows[i]['fingerprint_data'];
        }

        for (let key of Object.keys(map)) {
            const registered_fingerprints = map[key]['fingerprints'];
			let match = 0;
			let mismatch = 0;
			for (let rf_key of Object.keys(registered_fingerprints)) {
				if (rf_key in login_fingerprints) {
					if (registered_fingerprints[rf_key] === login_fingerprints[rf_key].toString()) {
						match += 1;
					} else {
						mismatch += 1;
					}
				} else {
					mismatch += 1;
				}
			}
			if(match / (match + mismatch) > 0.95){
			    return true;
            }

        }
        return false;
    }
};
