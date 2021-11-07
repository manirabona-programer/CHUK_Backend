const mysql = require("mysql");

class Database {
  getConnection() {
    const Db = mysql.createPool({
      host: "localhost",
      user: "root",
      password: "",
      database: "chuk_transfer",
    });
    return Db;
  }
}

module.exports = Database;
