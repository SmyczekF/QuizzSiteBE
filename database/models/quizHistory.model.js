const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  sequelize.define("QuizHistory", {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    score: {
      allowNull: false,
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    finishedOn: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    timeLimit: {
      allowNull: true,
      type: DataTypes.INTEGER,
      validate: {
        min: 0,
      },
    },
  });
};
