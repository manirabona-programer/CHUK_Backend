const mysql = require("mysql");

class Database {
  getConnection() {
    const Db = mysql.createPool({
      host: "localhost",
      user: "root",
      password: "",
      database: "chuk_transfer",
    });

    // Db.connect(function(error){
    //   if(!!error) {
    //     console.log(error);
    //   } else {
    //     console.log('Connected..!');
    //     return Db;
    //   }
    // });
  }
}

module.exports = Database;
