const CONSTANT = require('../constants');
const sqlite3 = require('sqlite3');

function callback(value) {
    console.log(value);
}


/*const UserDAO = require('./DAO/UserDAO.js');
let user = new UserDAO();
user.addUser("testmail@@", "poo", callback);*/

const TokenDAO = require('./DAO/TokenDAO.js');
let tokenDAO = new TokenDAO();
tokenDAO.addToken(5, "testmail@@", Date.now() + 86400000, callback);

var token = 5;
tokenDAO.getToken("testmail@@", function(auth_token){
	if(auth_token){
		if(token === CONSTANT.MASTERTOKEN || token === auth_token){
			tokenDAO.isExpired(token, function(expired){
				tokenDAO.consumeToken(token);
				if(!expired){
					console.log('success');
				}else{
					console.log('expired');
				}
			});
		} else {
			console.log('incorrect');
		}
	}else{
		console.log('nonexistent');
	}
});
