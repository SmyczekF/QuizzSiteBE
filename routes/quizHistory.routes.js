const express = require("express");
const router = express.Router();

const { getUserHistory } = require("../controllers/quizHistory.controller.js");

router.get("/user", getUserHistory);

module.exports = router;
