const { rejects } = require('assert');
const mysql = require('mysql');
const { resolve } = require('path');
const config = require(`./config`);


const connection = mysql.createConnection(config.mysql.Localhost);

connection.connect(function(err) {
    if (err) throw err;
});

module.exports = connection;
console.log()