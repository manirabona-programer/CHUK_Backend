const router = require("express").Router();
const { v4: uuidv4 } = require("uuid");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");

dotenv.config();

// datetime
const SysDatetime = require("../utils/datetime");
const DateTime = new SysDatetime().getFullDate();

// database
const DatabaseInst = require("../model/database");
const Db = new DatabaseInst().getConnection();

// jsonwebtoken
const verifyUserAuth = (req, res, next) => {
  const token = req.headers["x-access-token"];
  if (!token) {
    console.log("User is not Authenticated");
  } else {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        res.send({ Auth: false, Message: "User not authenticated" });
      } else {
        req.userId = decoded.id;
        next();
      }
    });
  }
};

router.get("/get/entryInfo/:Email", verifyUserAuth, (req, res) => {
  const Email = req.params.Email;
  const MasterQuery = "SELECT Master_id, Hospital_id, Master_name, Role, Active, Auth, Email FROM masters WHERE Email=?";
  Db.query(MasterQuery, [Email], (err, results) => {
    if (err) console.log(err);
    res.send(results);
  });
});

router.post("/post/admin/signin", (req, res) => {
  const Email = req.body.Email;
  const Password = req.body.Password;

  const CheckQuery = "SELECT Master_id FROM masters WHERE Email=? AND Password=?";
  Db.query(CheckQuery, [Email, Password], (err, rows) => {
    if (err) console.log(err);
    if (rows.length === 0) {
      res.send({ Auth: false, status: 0, Message: "user don't Exists" });
    } else {
      const UserId = rows["0"].Master_id;
      const token = jwt.sign({ UserId }, process.env.JWT_SECRET, {
        expiresIn: 3000,
      });
      res.send({ Auth: true, token: token, Message: "user Exists", status: 1, results: rows });
    }
  });
});

// router.get("/api/post/users/signup", (req, res) => {
//   const Email = req.body.Email;

//   const CheckQuery = "SELECT * FROM masters WHERE Email=?";
//   Db.query(CheckQuery, [Email], (err, rows, fields, result) => {
//     if (err) console.log(err);
//     if(rows.length != 0){
//       res.send({Message: "user already Exists", status: 2});
//     }else{
//       const InsertQuery = "INSERT INTO masters VALUES (?, ?, ?)"
//     }
//   });
// });

module.exports = router;