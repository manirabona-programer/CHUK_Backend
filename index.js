const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");

// Routers
const useHospitalRoute = require("./routes/hospital");
const useTransfer = require("./routes/transfer");
const useUsers = require("./routes/users");
const View = require("./routes/view");

// middlewares
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// route middleware
app.use("/api/hospital", useHospitalRoute);
app.use("/api/transfer", useTransfer);
app.use("/api/users", useUsers);
app.use("/api/view", View);

// Port config
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
