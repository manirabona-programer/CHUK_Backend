const router = require("express").Router();
const jwt = require("jsonwebtoken");

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
        res.send({ Auth: false, Message: "User not authorized" });
      } else {
        req.userId = decoded.id;
        next();
      }
    });
  }
};

router.get("/get/chart/:hospitalid", verifyUserAuth, (req, res) => {
  const Hospitalid = req.params.hospitalid;
  const Query =
    "SELECT month(date(Registed_date)) as month, COUNT(Hospital_id) as count from transfers WHERE month(date(Registed_date)) IN (SELECT DISTINCT month(date(Registed_date)) FROM transfers) AND Hospital_id=? GROUP by month(date(Registed_date))";
  Db.query(Query, [Hospitalid], (err, results) => {
    if (err) console.log(err);
    res.send(results);
  });
});

module.exports = router;
