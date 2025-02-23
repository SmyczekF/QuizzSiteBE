function applyAssociations(sequelize) {
  const { User, Quiz, Option, Question, Translation, Genre, QuizHistory } =
    sequelize.models;

  Question.hasMany(Option);
  Quiz.hasMany(Question);
  Quiz.belongsTo(User, { as: "Author", foreignKey: "UserId" });
  User.hasMany(Quiz, { as: "CreatedQuizzes", foreignKey: "UserId" });
  Translation.belongsToMany(Quiz, { through: "TranslationQuiz" });
  Quiz.belongsToMany(Translation, { through: "TranslationQuiz" });
  Translation.hasOne(Question);
  Translation.hasOne(Option);
  Genre.belongsToMany(Quiz, { through: "GenreQuiz" });
  Quiz.belongsToMany(Genre, { through: "GenreQuiz" });
  QuizHistory.belongsTo(User);
  QuizHistory.belongsTo(Quiz);
  User.hasMany(QuizHistory);
  Quiz.hasMany(QuizHistory);
  User.belongsToMany(Quiz, { through: "Like", as: "LikedQuizzes" });
  Quiz.belongsToMany(User, { through: "Like", as: "LikedBy" });
}

module.exports = { applyAssociations };
