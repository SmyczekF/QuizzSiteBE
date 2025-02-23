const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  sequelize.define("Quiz", {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    title: {
      allowNull: false,
      type: DataTypes.STRING,
      unique: true,
    },
    description: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    image: {
      allowNull: true,
      type: DataTypes.BLOB("long"),
    },
    liked: {
      allowNull: false,
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    finished: {
      allowNull: false,
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    color: {
      allowNull: false,
      type: DataTypes.STRING,
      defaultValue: "grey",
    },
  });
};
