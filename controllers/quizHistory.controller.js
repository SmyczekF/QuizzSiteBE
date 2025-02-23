const sequelize = require("../database/sequelize-initializer");

const getUserHistory = async function (req, res) {
  try {
    if (!req.session || !req.session.user) {
      res.status(401).send("Not logged in");
      return;
    }
    const UserId = req.session.user.id;
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;

    const userHistory = await sequelize.models.QuizHistory.findAll({
      where: {
        UserId: UserId,
      },
      include: [
        {
          model: sequelize.models.Quiz,
          attributes: [
            "id",
            "title",
            "description",
            "liked",
            "finished",
            "color",
          ],
          include: [
            {
              model: sequelize.models.User,
              attributes: ["username"],
            },
          ],
        },
      ],
      offset: (page - 1) * limit,
      limit: limit,
      order: [["finishedOn", "DESC"]],
    });

    res.send(userHistory);
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server error");
  }
};

module.exports = {
  getUserHistory,
};
