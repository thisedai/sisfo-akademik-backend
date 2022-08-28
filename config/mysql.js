const mysql = require("mysql");
require("dotenv").config();

let dbConfig = {
    connectionLimit : process.env.DB_CONNECTION_LIMIT,
    connectTimeout  : 60 * 60 * process.env.DB_CONNECTION_LIMIT,
    acquireTimeout  : 60 * 60 * process.env.DB_CONNECTION_LIMIT,
    timeout         : 60 * 60 * process.env.DB_CONNECTION_LIMIT,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    // timezone: 'UTC',
    dateStrings: [
        'DATE',
        'DATETIME'
    ]
};
const pool = mysql.createPool(dbConfig);
const connection = () => {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) reject(err);
            // console.log("MySQL pool connected: threadId " + connection.threadId);
            const changeUser = (database) => {
                return new Promise((resolve, reject) => {
                    if (err) reject(err);
                    // console.log("MySQL pool connected: threadId " + connection.threadId + ", use database " + database);
                    resolve(connection.changeUser({database: database}));
                });
            };
            const query = (sql, binding) => {
                return new Promise((resolve, reject) => {
                    connection.query(sql, binding, (err, result) => {
                        if (err) reject(err);
                        resolve(result);
                    });
                });
            };
            const release = () => {
                return new Promise((resolve, reject) => {
                    if (err) reject(err);
                    // console.log("MySQL pool released: threadId " + connection.threadId);
                    resolve(connection.release());
                });
            };
            resolve({ query, release, changeUser });
        });
    });
};

const query = (sql, binding) => {
    return new Promise((resolve, reject) => {
        pool.query(sql, binding, (err, result, fields) => {
            if (err) reject(err);
            resolve(result);
        });
    });
};
module.exports = { pool, connection, query };