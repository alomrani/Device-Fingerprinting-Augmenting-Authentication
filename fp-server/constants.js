exports.PORT = '3001'; // Port when deployed to local
exports.DATABASE = './Database/database.db';  // Location of database
exports.MASTERTOKEN = 'DEV_TOKEN'; //  USe MASTER TOKEN for testing purposes

exports.DEVICE_TYPE_ANDROID = "ANDROID";
exports.DEVICE_TYPE_WEB = "WEB";

exports.MAILER_EMAIL_ID = process.env.MAILER_EMAIL_ID || 'fingerprinting.authentication@gmail.com';
exports.MAILER_PASSWORD = process.env.MAILER_PASSWORD || 'DeviceFAA98';