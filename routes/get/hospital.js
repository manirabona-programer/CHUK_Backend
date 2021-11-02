const express = require("express");
const Route = express.Router();

// connected hospital
Route.get("/connectedHospital", (req, res) => {
   res.send("connected hospital requested");
})