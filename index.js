const express = require("express");
const app = express();
const mysql = require("mysql");
const bodyParser = require("body-parser");
const cors = require("cors");

const SysDatetime = require("./utils/datetime");
const DateTime = new SysDatetime().getFullDate();

// middlewares
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// database
const Db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "chuk_transfer",
});

app.get("/api/get/hospital/connectedHospital/:hospitalId", (req, res) => {
  const hospitalId = req.params.hospitalId;
  const query =
    "SELECT * FROM Hospitals WHERE Hospital_id IN (SELECT DISTINCT guest_id FROM connections WHERE Host_id=? AND connection_status=?)";
  Db.query(query, [hospitalId, 1], (err, result) => {
    if (err) console.log(err);
    res.send(result);
  });
});

app.get("/api/get/hospital/adminList/:masterId", (req, res) => {
  const adminId = req.params.masterId;
  const query = "SELECT * FROM juniors WHERE Master_id=? AND active=?";
  Db.query(query, [adminId, 1], (err, result) => {
    if (err) console.log(err);
    res.send(result);
  });
});

app.get("/api/get/hospital/departmentDetail/:hospitalId", (req, res) => {
  const hospitalId = req.params.hospitalId;
  const query = "SELECT * FROM branches WHERE hospital_id=?";
  Db.query(query, [hospitalId], (err, result) => {
    if (err) console.log(err);
    res.send(result);
  });
});

app.get("/api/get/hospital/departTeamList/:hospitalId", (req, res) => {
  const hospitalId = req.params.hospitalId;
  const query = "SELECT * FROM branches WHERE hospital_id=?";

  Db.query(query, [hospitalId], (err, result) => {
    if (err) console.log(err);
    res.send(result);
  });
});

app.get("/api/get/hospital/departTeamList/all/:DepartmentId", (req, res) => {
  const departmentId = req.params.DepartmentId;
  const query =
    "SELECT *, count(team_id) FROM team_member WHERE team_id IN (SELECT DISTINCT team_id FROM teams WHERE branch_id=?) ";
  Db.query(query, [departmentId], (err, results) => {
    if (err) console.log(err);
    res.send(results);
  });
});

app.get("/api/get/transfer/calender/years/:sort", (req, res) => {
  const sort = req.params.sort;
  console.log(sort);
  const query =
    "SELECT DISTINCT year(date(registed_date)) as years FROM transfer_main ORDER BY date(registed_date) ?";
  Db.query(query, [sort.replace("'", " ")], (err, result) => {
    if (err) console.log(err);
    res.send(result);
  });
});

// GET ALL TRANSFER FORM DATA FROM CLIENT
app.post("/api/post/transfer/formData/:juniorId", (req, res) => {
  const JuniorId = req.params.juniorId;
  const SaveQuery = "INSERT INTO transfers VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
  Db.query(
    SaveQuery,
    [
      "23721uiqsyub32672",
      req.body.Hospital_id,
      JuniorId,
      req.body.Recipient,
      req.body.Assurance,
      req.body.CareProvider,
      "true",
      req.body.NB,
      DateTime,
    ],
    (err) => {
      if (err) {
        res.send({ Message: "Trasfer Main Falied", status: 0 });
      } else {
        // get the current Transfer id
        const TransferId =
          "SELECT Transfer_id FROM transfers WHERE Registed_date=?";
        Db.query(TransferId, [DateTime], (err, result) => {
          const TransId = result[0].Transfer_id;

          // insert into next table (EXTERNAL)
          const External =
            "INSERT INTO transfer_external VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
          Db.query(
            External,
            [
              "362736712",
              TransId,
              req.body.Client,
              req.body.DOB,
              req.body.Sex,
              req.body.Telephone,
              req.body.Caregiver,
              req.body.District,
              req.body.Sector,
              req.body.Cell,
              req.body.Village,
              req.body.Services,
              req.body.TransferType,
              "no",
              req.body.Transferreason,
              DateTime,
            ],
            (err, result) => {
              if (err) {
                console.log(err);
                res.send({ Message: "transfer external Failed", status: 0 });
              } else {
                res.send({
                  Message: "transfer external Successfull",
                  status: 1,
                });

                // insert into signoring
                const Signoring =
                  "INSERT INTO transfer_significant VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                Db.query(
                  Signoring,
                  [
                    "3647duqwbn3782",
                    TransId,
                    req.body.ClinicalPresent,
                    req.body.ImmidiateCondition,
                    req.body.Disability,
                    "none",
                    req.body.Laboratory,
                    req.body.Diagnosis,
                    req.body.ProcedureTreatment,
                    req.body.TransportType,
                    DateTime,
                  ],
                  (err, result) => {
                    if (err) {
                      console.log(err);
                      res.send({
                        Message: "transfer sign Failed",
                        status: 0,
                      });
                    } else {
                      res.send({
                        Message: "transfer sign  Successfull",
                        status: 1,
                      });
                    }
                  }
                );
              }
            }
          );
        });
      }
    }
  );
});

app.get("/api/get/tranfer/onWait/:adminId", (req, res) => {
  const onWaitQuery =
    "SELECT transfers.*, transfer_external.* FROM transfers INNER JOIN transfer_external where transfers.Transfer_id = transfer_external.Transfer_id and transfers.Processed='false'";
  Db.query(onWaitQuery, (err, result) => {
    if (err) console.log(err);
    res.send(result);
  });
});

// app.get("/api/post/users/signup", (req, res) => {
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

// ADMIN LOGIN
app.post("/api/post/admin/signin", (req, res) => {
  const Email = req.body.Email;
  const Password = req.body.Password;

  const CheckQuery = "SELECT * FROM juniors WHERE Email=? AND Password=?";
  Db.query(CheckQuery, [Email, Password], (err, rows) => {
    if (err) console.log(err);
    res.send(
      rows.length === 0
        ? { status: 0, Message: "user don't Exists" }
        : { Message: "user Exists", status: 1 }
    );
  });
});

app.get("/api/get/user/entryInfo/:Email", (req, res) => {
  const Email = req.params.Email;

  const MasterQuery = "SELECT * FROM masters WHERE Email=?";
  Db.query(MasterQuery, [Email], (err, rows) => {
    if (err) console.log(err);
    if (rows.length === 0) {
      const JuniorQuery = "SELECT * FROM juniors WHERE Email=?";
      Db.query(JuniorQuery, [Email], (error, results) => {
        if (error) console.log(error);
        if (results.length === 0) {
          res.send({ Message: "Missed both Master and juniors", status: 0 });
        } else {
          res.send({ Message: "found in master", data: results, status: 1 });
        }
      });
    } else {
      res.send({ Message: "found in master", data: rows, status: 1 });
    }
  });
});

// Port config
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
