const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const _ = require('lodash');
const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');

const CONSTANT = require('./constants');

// Database
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(CONSTANT.DATABASE);

// Routers
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');
const devicesRouter = require('./routes/devices');

// DAO's
const UserDAO = require('./database/DAO/UserDAO.js');
const FingerprintDAO = require('./database/DAO/FingerprintDAO.js');
const TokenDAO = require('./database/DAO/TokenDAO.js');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter);
app.use('/devices', devicesRouter);

module.exports = app;

console.log("~Server started on port: " + CONSTANT.PORT);