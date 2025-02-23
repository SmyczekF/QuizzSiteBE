const sequelize = require("../database/sequelize-initializer");

const getAll = async function (req, res) {
  try {
    const orderBy = req.query.order || "finished";
    const orderDir = req.query.orderDir || "DESC";
    const genreName = req.params.genreName;
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;

    const quizzes = await sequelize.models.Quiz.findAll({
      include: [
        {
          model: sequelize.models.User,
          as: "Author",
          attributes: ["username", "image"],
        },
        {
          model: sequelize.models.Genre,
          where: { name: genreName },
          attributes: [],
          through: { attributes: [] },
        },
      ],
      attributes: [
        "id",
        "title",
        "description",
        "color",
        "createdAt",
        [
          sequelize.literal(`(
            SELECT COUNT(*)
            FROM "QuizHistories"
            WHERE "QuizHistories"."QuizId" = "Quiz"."id"
          )`),
          "finishCount",
        ],
        [
          sequelize.literal(`(
            SELECT COUNT(*)
            FROM "Likes"
            WHERE "Likes"."QuizId" = "Quiz"."id"
          )`),
          "likeCount",
        ],
      ],
      group: [
        "Quiz.id",
        "Quiz.title",
        "Quiz.description",
        "Quiz.color",
        "Quiz.createdAt",
        "Author.id",
        "Author.username",
        "Author.image",
      ],
      offset: (page - 1) * limit,
      limit: limit,
      order: [
        [
          sequelize.col(
            orderBy === "finished"
              ? "finishCount"
              : orderBy === "likes"
              ? "likeCount"
              : "createdAt"
          ),
          orderDir,
        ],
      ],
      subQuery: false,
    });

    const totalCount = await sequelize.models.Quiz.count({
      include: {
        model: sequelize.models.Genre,
        where: { name: genreName },
      },
    });

    res.send({
      quizzes: quizzes,
      totalCount: totalCount,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server error");
  }
};

const get = async function (req, res) {
  try {
    if (req.params.quizID === undefined) {
      res.status(400).send("Bad request");
      return;
    }
    const quiz = await sequelize.models.Quiz.findOne({
      where: {
        id: req.params.quizID,
      },
      include: [
        {
          model: sequelize.models.Question,
          include: {
            model: sequelize.models.Option,
            attributes: ["id", "text", "order", "image"],
          },
        },
        {
          model: sequelize.models.User,
          as: "Author",
          attributes: ["username", "image"],
        },
        {
          model: sequelize.models.Genre,
          attributes: ["name"],
          through: { attributes: [] },
        },
      ],
    });
    if (quiz) {
      res.send(quiz);
    } else {
      res.status(404).send("Quiz not found");
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server error");
  }
};

const createQuiz = async function (req, res) {
  try {
    const questions = req.body.questions;
    const genres = req.body.genres;

    if (!genres || !questions) {
      res.status(400).send("No questions or genres provided");
      return null;
    }

    const quiz = await sequelize.models.Quiz.findOne({
      where: {
        title: req.body.title,
      },
    });
    if (quiz) {
      res.status(409).send("Quiz with that name already exists");
    } else if (
      !req.session ||
      !req.session.user ||
      !req.session.user.username
    ) {
      res.status(401).send("Unauthorized");
    } else {
      const user = await sequelize.models.User.findOne({
        where: {
          username: req.session.user.username,
        },
      });
      if (!user) {
        res.status(404).send("User not found");
        return;
      }
      const newQuiz = await sequelize.models.Quiz.create({
        ...req.body,
        UserId: user.id,
      });

      questions.forEach(async (question) => {
        const newQuestion = await sequelize.models.Question.create(question);
        await newQuiz.addQuestion(newQuestion);

        const options = question.options;
        options.forEach(async (option) => {
          const newOption = await sequelize.models.Option.create(option);
          await newQuestion.addOption(newOption);
        });
      });
      genres.forEach(async (genre) => {
        const [newGenre, created] = await sequelize.models.Genre.findOrCreate({
          where: {
            name: genre,
          },
          defaults: { name: genre },
        });
        await newQuiz.addGenre(newGenre);
      });
      res.send(newQuiz);
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server error");
  }
};

const updateQuiz = async function (req, res) {
  try {
    if (req.params.quizID === undefined) {
      res.status(400).send("Bad request");
      return;
    }
    const quiz = await sequelize.models.Quiz.findOne({
      where: {
        id: req.params.quizID,
      },
    });

    if (quiz) {
      const updatedQuiz = await sequelize.models.Quiz.update(req.body, {
        where: {
          id: req.params.quizID,
        },
      });

      const questions = req.body.questions;
      const genres = req.body.genres;
      if (questions) {
        questions.forEach(async (question) => {
          const updatedQuestion = await sequelize.models.Question.update(
            question,
            {
              where: {
                id: question.id,
              },
            }
          );
          updateQuiz.addQuestion(updatedQuestion);

          const options = question.options;
          options.forEach(async (option) => {
            const updatedOption = await sequelize.models.Option.update(option, {
              where: {
                id: option.id,
              },
            });
            updatedQuestion.addOption(updatedOption);
          });
        });
        res.send(updatedQuiz);
      }

      if (genres) {
        genres.forEach(async (genre) => {
          const updatedGenre = await sequelize.models.Genre.update(genre, {
            where: {
              id: genre.id,
            },
          });
          updatedQuiz.addGenre(updatedGenre);
        });
        res.send(updatedQuiz);
      }
    } else {
      res.status(404).send("Quiz not found");
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server error");
  }
};

const deleteQuiz = async function (req, res) {
  try {
    if (req.params.quizID === undefined) {
      res.status(400).send("Bad request");
      return;
    }
    const quiz = await sequelize.models.Quiz.findOne({
      where: {
        id: req.params.quizID,
      },
    });

    if (quiz) {
      await sequelize.models.Quiz.destroy({
        where: {
          id: req.params.quizID,
        },
      });
      res.send("Quiz deleted");
    } else {
      res.status(404).send("Quiz not found");
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server error");
  }
};

const calculateScore = function (answers, correctAnswers) {
  let score = 0;
  answers.forEach((answer) => {
    const correctAnswer = correctAnswers.find(
      (correctAnswer) => correctAnswer.questionId === answer.questionId
    );
    if (!correctAnswer) {
      return 0;
    }
    if (correctAnswer.answerId) {
      if (answer.answerId === correctAnswer.answerId) {
        score++;
      }
    } else {
      const correctAnswerIds = correctAnswer.answerIds;
      const answerIds = answer.answerIds;
      let tempScore = 0;
      answerIds.forEach((answerId) => {
        if (correctAnswerIds.includes(answerId)) {
          tempScore++;
        } else {
          tempScore--;
        }
      });
      if (tempScore < 0) {
        tempScore = 0;
      }
      score += tempScore / correctAnswerIds.length;
    }
  });
  return (score / correctAnswers.length) * 100;
};

const validateAnswers = async function (req, res) {
  try {
    if (req.params.quizID === undefined) {
      res.status(400).send("Bad request");
      return;
    }
    const quiz = await sequelize.models.Quiz.findOne({
      where: {
        id: req.params.quizID,
      },
      include: [
        {
          model: sequelize.models.Question,
          include: {
            model: sequelize.models.Option,
            attributes: ["id", "isCorrect"],
          },
        },
      ],
    });
    if (quiz) {
      const questions = quiz.Questions;
      // answers = [{questionId: number, answerId: number, answerIds: number[]}]
      const answers = req.body.answers;
      const correctAnswers = [];
      questions.forEach((question) => {
        if (question.type === "single_choice") {
          const correctAnswer = question.Options.find(
            (option) => option.isCorrect === true
          );
          correctAnswers.push({
            questionId: question.id,
            answerId: correctAnswer.id,
            answerIds: [],
          });
        } else if (question.type === "multiple_choice") {
          const correctAnswersForQuestion = question.Options.filter(
            (option) => option.isCorrect === true
          );
          const correctAnswerIds = correctAnswersForQuestion.map(
            (option) => option.id
          );
          correctAnswers.push({
            questionId: question.id,
            answerId: null,
            answerIds: correctAnswerIds,
          });
        }
      });
      const score = calculateScore(answers, correctAnswers);
      // Save the score to the database
      await sequelize.models.QuizHistory.create({
        score: score,
        QuizId: quiz.id,
        UserId: req.session?.user?.id || null,
        finishedOn: new Date(),
      });
      res.send({ score: score, correctAnswers: correctAnswers });
    } else {
      res.status(404).send("Quiz not found");
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server error");
  }
};

const getQuizByUser = async function (req, res) {
  try {
    if (!req.session || !req.session.user) {
      res.status(401).send("Not logged in");
      return;
    }
    const UserId = req.session.user.id;
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;

    const userQuizzes = await sequelize.models.Quiz.findAll({
      where: {
        UserId: UserId,
      },
      include: [
        {
          model: sequelize.models.Genre,
          attributes: ["name"],
          through: { attributes: [] },
        },
      ],
      offset: (page - 1) * limit,
      limit: limit,
      order: [["createdAt", "DESC"]],
    });

    res.send(userQuizzes);
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server error");
  }
};

const getQuizFinishes = async function (req, res) {
  try {
    if (req.params.quizID === undefined) {
      res.status(400).send("Bad request");
      return;
    }

    const finishes = await sequelize.models.QuizHistory.count({
      where: {
        QuizId: req.params.quizID,
      },
    });

    res.send({ finishes });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server error");
  }
};

const getQuizLikes = async function (req, res) {
  try {
    if (req.params.quizID === undefined) {
      res.status(400).send("Bad request");
      return;
    }

    const likes = await sequelize.models.Like.count({
      where: {
        QuizId: req.params.quizID,
      },
    });

    res.send({ likes });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server error");
  }
};

module.exports = {
  getAll,
  get,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  validateAnswers,
  getQuizByUser,
  getQuizFinishes,
  getQuizLikes,
};
