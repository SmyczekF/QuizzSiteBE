const express = require("express");
const router = express.Router();

const {
  getAll,
  get,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  validateAnswers,
  getQuizByUser,
  getQuizFinishes,
  getQuizLikes,
  like,
  getFavourites,
} = require("../controllers/quiz.controller.js");
const canEditQuiz = require("../middlewares/can_edit_quiz.js");

router.get("/get/genre/:genreName", getAll);

router.get("/get/:quizID", get);

router.get("/get/:quizID/edit", canEditQuiz, get);

router.post("/add/", createQuiz);

router.post("/update/:quizID", updateQuiz);

router.delete("/:quizID", deleteQuiz);

router.post("/finish/:quizID", validateAnswers);

router.get("/finished", getQuizFinishes);

router.get("/favourites", getFavourites);

router.get("liked", getQuizLikes);

router.get("/myQuizzes", getQuizByUser);

router.post("/like/:quizID", like);

module.exports = router;
