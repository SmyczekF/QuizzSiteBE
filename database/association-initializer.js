function applyAssociations(sequelize) {
	const { User, Quiz, Option, Question, Translation } = sequelize.models;

    Question.hasMany(Option);
    Quiz.hasMany(Question);
    Quiz.belongsTo(User);
    Translation.belongsToMany(Quiz, { through: 'TranslationQuiz' });
    Translation.hasOne(Question);
    Translation.hasOne(Option);
}

module.exports = { applyAssociations };