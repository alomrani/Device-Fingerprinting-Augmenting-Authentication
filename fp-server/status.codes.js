// Status codes for the server to send to the caller

exports.SUCCESS = 200; // Success status code for any type of request
exports.LOGIN_SUCCESS_REGISTER_DEVICE = 240; //  Registers a new device when token is provided
exports.REGISTER_FAIL = 440; // Fail to register: likely duplicate username
exports.LOGIN_FAIL_CREDENTIALS = 441; // Fail to login: username or password incorrect
exports.LOGIN_FAIL_FINGERPRINT_MISMATCH = 442; // Fail to login: fingerprints mismatch
exports.LOGIN_FAIL_NO_DEVICE = 444; // Fail to login: No device found

exports.TOKEN_FAIL_INCORRECT = 450; //  When user provides an incorrect token
exports.TOKEN_FAIL_EXPIRED = 451; //  When user provides an incorrect token
exports.TOKEN_DOES_NOT_EXIST = 452; //  When user provides an incorrect token

exports.FAIL_UNKOWN = 499; // This code should never appear. Probably database/network error if it does.