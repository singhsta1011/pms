const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload.middleware");

router.post("/image", upload.single("file"), (req, res) => {
  res.json({
    message: "Upload successful",
    file: req.file.filename,
  });
});

module.exports = router;
