const sequelize = require("../database/sequelize-initializer");

const canEditQuiz = async (req, res, next) => {
  try {
    const quiz = await sequelize.models.Quiz.findOne({
      where: { id: req.params.quizID },
    });

    if (!quiz) {
      return res.status(404).send("Quiz not found");
    }

    if (
      !req.session?.user?.role === "admin" &&
      quiz.UserId !== req.session?.user?.id
    ) {
      return res.status(403).send("Not authorized to edit this quiz");
    }

    req.context = { isEdit: true };
    next();
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server error");
  }
};

module.exports = canEditQuiz;
