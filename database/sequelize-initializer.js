const { Sequelize } = require("sequelize");
const { applyAssociations } = require("./association-initializer");

const sequelize = new Sequelize(process.env.DB_CONNECTION);

const modelDefiners = [
  require("./models/user.model"),
  require("./models/quiz.model"),
  require("./models/question.model"),
  require("./models/option.model"),
  require("./models/translation.model"),
  require("./models/genre.model"),
  require("./models/quizHistory.model"),
  require("./models/like.model"),
];

for (const modelDefiner of modelDefiners) {
  modelDefiner(sequelize);
}

applyAssociations(sequelize);

module.exports = sequelize;
