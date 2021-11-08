const router = require("express").Router();
const { v4: uuidv4 } = require("uuid");
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
    res.send({Message: "User is not Authenticated", status: 0});
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

router.get("/get/notifications/:hospitalid", verifyUserAuth, (req, res) => {
  const Hospitalid = req.params.hospitalid;
  const Query =
    "SELECT * FROM transfers WHERE Reciever_id=? AND Processed=? ORDER BY Registed_date DESC";
  Db.query(Query, [Hospitalid, false], (err, results) => {
    if (err) console.log(err);
    res.send(results);
  });
});

router.get("/get/History/:Hospital_id", verifyUserAuth, (req, res) => {
  const Hospital_id = req.params.Hospital_id;
  const Query =
    "SELECT transfers.*,transfer_external.* FROM transfers inner join transfer_external WHERE transfers.Processed=? or transfers.Processed=? AND transfers.Reciever_id=?";
  Db.query(Query, [`true`, `forgotten`, Hospital_id], (err, results) => {
    if (err) console.log(err);
    res.send(results);
  });
});

router.get("/get/onWait/:Hospital_id", verifyUserAuth, (req, res) => {
  const Hospital_id = req.params.Hospital_id;
  const onWaitQuery =
    "SELECT transfers.*, transfer_external.* FROM transfers INNER JOIN transfer_external where transfers.Processed=? AND transfers.Reciever_id=?";
  Db.query(onWaitQuery, ["False", Hospital_id], (err, result) => {
    if (err) console.log(err);
    res.send(result);
  });
});

router.get(
  "/api/get/transfer/calender/years/:sort",
  verifyUserAuth,
  (req, res) => {
    const sort = req.params.sort;
    console.log(sort);
    const query =
      "SELECT DISTINCT year(date(Registed_date)) as years FROM Transfers ORDER BY date(Registed_date) ?";
    Db.query(query, [sort.replace("'", " ")], (err, result) => {
      if (err) console.log(err);
      res.send(result);
    });
  }
);

router.post("/post/formData/:Master_id", (req, res) => {
  const Master_id = req.params.Master_id;
  const UserId = uuidv4();
  const SaveQuery = "INSERT INTO transfers VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
  Db.query(
    SaveQuery,
    [
      UserId,
      req.body.Hospital_id,
      req.body.Recipient,
      req.body.Assurance,
      req.body.CareProvider,
      "False",
      req.body.NB,
      DateTime,
    ],
    (err) => {
      if (err) {
        res.send({ Message: "Trasfer Main Falied", status: 0, err: err });
      } else {
        // get the current Transfer id
        const TransferId =
          "SELECT Transfer_id FROM transfers WHERE Registed_date=?";
        Db.query(TransferId, [DateTime], (err, result) => {
          const TransId = result[0].Transfer_id;

          // insert into next table (EXTERNAL)
          const External =
            "INSERT INTO transfer_external VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
          const UserId = uuidv4();
          Db.query(
            External,
            [
              UserId,
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
                const UserId = uuidv4();
                Db.query(
                  Signoring,
                  [
                    UserId,
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

router.put("/put/transferSignal/accept/:transferId", (req, res) => {
  const Transfer_id = req.params.transferId;
  const query = "UPDATE transfers SET Processed='true' WHERE Transfer_id=?";
  Db.query(query, [Transfer_id], (err, result) => {
    if(err) return err;
    res.json(result);
  });
})

router.put("/put/transferSignal/reject/:transferId", (req, res) => {
  const Transfer_id = req.params.transferId;
  const query = "UPDATE transfers SET Processed='rejected' WHERE Transfer_id=?";
  Db.query(query, [Transfer_id], (err, result) => {
    if(err) return err;
    res.json(result);
  });
})

router.put("/put/transferSignal/forget/:transferId", (req, res) => {
  const Transfer_id = req.params.transferId;
  const query = "UPDATE transfers SET Processed='forgotten' WHERE Transfer_id=?";
  Db.query(query, [Transfer_id], (err, result) => {
    if(err) return err;
    res.json(result);
  });
})


module.exports = router;
