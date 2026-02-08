const express = require("express");
const multer = require("multer");
const router = express.Router();
const {getLeaseReport,uploadLease} = require("../controllers/lease.controller");

// Tmp folder for uploads
const upload = multer({ dest: "tmp/" });

// Usage: POST /lease/upload
router.post("/upload", upload.single("file"), uploadLease);

// Usage: GET /lease/report/:documentId
router.get("/report/:documentId", getLeaseReport);

module.exports = router;