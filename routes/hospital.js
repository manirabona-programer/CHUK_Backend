const router = require("express").Router();
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");

// datetime
const SysDatetime = require("../utils/datetime");
const DateTime = new SysDatetime().getFullDate();

// database
const DatabaseInst = require('../model/database');
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

router.get("/get/connectedHospital/:hospitalId", verifyUserAuth, (req, res) => {
  const hospitalId = req.params.hospitalId;
  const query =
    "SELECT DISTINCT Reciever_id, Hospital_id FROM transfers WHERE Hospital_id=? AND Reciever_id!=? or Hospital_id!=? and Reciever_id=?";
  Db.query(query, [hospitalId, hospitalId, hospitalId, hospitalId], (err, results) => {
    if (err) console.log(err);
    res.send(results);
  });
});

router.get("/get/departmentDetail/:hospitalId", verifyUserAuth, (req, res) => {
  const hospitalId = req.params.hospitalId;
  const query = "SELECT * FROM branches WHERE Hospital_id=?";
  Db.query(query, [hospitalId], (err, result) => {
    if (err) console.log(err);
    res.send(result);
  });
});

router.post("/post/Team/", verifyUserAuth, (req, res) => {
  const UserId = uuidv4();
  const query = "INSERT INTO teams VALUES (?, ?, ?, ?)";
  Db.query(
    query,
    [UserId, req.body.BranchId, req.body.TeamName, DateTime],
    (err, results) => {
      if (err) console.log(err);
      res.send({ Message: "Team created successfully", data: results });
    }
  );
});

router.post("/post/Branch/:HospitalId", verifyUserAuth, (req, res) => {
  const HospitalId = req.params.HospitalId;
  const UserId = uuidv4();

  const Query = "INSERT INTO branches VALUES (?, ?, ?, ?, ?)";
  Db.query(
    Query,
    [UserId, HospitalId, req.body.BranchName, req.body.BranchDesc, DateTime],
    (err, results) => {
      if (err) console.log(err);
      res.send({ Message: "Query perfomed Successfully", Data: results });
    }
  );
});

router.get("/get/detail/:HospitalId", verifyUserAuth, (req, res) => {
  const HospitalId = req.params.HospitalId;
  const MasterQuery = "SELECT * FROM hospitals WHERE Hospital_id=?";
  Db.query(MasterQuery, [HospitalId], (err, results) => {
    if (err) console.log(err);
    res.send(results);
  });
});

router.get("/get/hospitalIds", verifyUserAuth, (req, res) => {
  const MasterQuery = "SELECT * FROM hospitals";
  Db.query(MasterQuery, (err, results) => {
    if (err) console.log(err);
    res.send(results);
  });
});

router.get("/get/masters/:hospitalId", verifyUserAuth, (req, res) => {
  const Hospital_id = req.params.hospitalId;
  const MasterQuery = "SELECT * FROM masters WHERE Hospital_id=?";
  Db.query(MasterQuery, [Hospital_id], (err, results) => {
    if (err) console.log(err);
    res.send(results);
  });
});

router.get("/get/departTeamList/all/:DepartmentId", verifyUserAuth, (req, res) => {
  const departmentId = req.params.DepartmentId;
  const query = "SELECT * FROM teams WHERE Branch_id=?";
  Db.query(query, [departmentId], (err, rows) => {
    if (err) console.log(err);
    const Count =
      "SELECT count(Member_id) as count FROM team_member WHERE Team_id=? GROUP BY Team_id ";
    Db.query(Count, [rows[0].Team_id], (err, results) => {
      if (err) console.log(err);
      rows[0].TeamMember = results[0];
      const NewResult = rows[0];
      res.send(rows);
    });
  });
});

router.get("/get/departTeamList/:hospitalId", verifyUserAuth, (req, res) => {
  const hospitalId = req.params.hospitalId;
  const query = "SELECT * FROM branches WHERE hospital_id=?";
  Db.query(query, [hospitalId], (err, results) => {
    if (err) console.log(err);
    res.send(results);
  });
});

router.get("/get/adminList/:masterId", verifyUserAuth, (req, res) => {
  const adminId = req.params.masterId;
  const query = "SELECT * FROM master WHERE Role=? AND active=?";
  Db.query(query, ["Junior", 1], (err, result) => {
    if (err) console.log(err);
    res.send(result);
  });
});

router.get("/get/detail/name/:HospitalId", verifyUserAuth, (req, res) => {
  const HospitalId = req.params.HospitalId;
  const MasterQuery = "SELECT * FROM hospitals WHERE Hospital_id=?";
  Db.query(MasterQuery, [HospitalId], (err, results) => {
    if (err) console.log(err);
    res.send(results);
  });
});

module.exports = router;
