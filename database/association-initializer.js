function applyAssociations(sequelize) {
	const { User, Quiz, Option, Question, Translation, Genre } = sequelize.models;

    Question.hasMany(Option);
    Quiz.hasMany(Question);
    Quiz.belongsTo(User);
    Translation.belongsToMany(Quiz, { through: 'TranslationQuiz' });
    Quiz.belongsToMany(Translation, { through: 'TranslationQuiz' });
    Translation.hasOne(Question);
    Translation.hasOne(Option);
    Genre.belongsToMany(Quiz, { through: 'GenreQuiz' });
    Quiz.belongsToMany(Genre, { through: 'GenreQuiz' });
}

module.exports = { applyAssociations };