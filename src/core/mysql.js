const os = require("os");
const gprop = require('../etc/'+(os.platform()=="linux"?"config-linux":"config")).prop;
const mysql = require('mysql');
var pool  = mysql.createPool({
    connectionLimit : gprop.db_pool,
    host            : gprop.db_host,
    user            : gprop.db_user,
    password        : gprop.db_password,
    database        : gprop.db_name
});

function query(sql, cb) {
    if(!sql){
        return cb("Empty Sql");
    }
    pool.getConnection((err, connection) => {
        if (err) {
            return cb(err);
        } // not connected!
        // Use the connection
        connection.query(sql, (err, results, fields) => {
            connection.release();
            if (err) {
                return cb(err);
            }
            cb(0, results, fields);
            // Don't use the connection here, it has been returned to the pool.
        });
    });
}
exports.escape = mysql.escape;
exports.query = query;
