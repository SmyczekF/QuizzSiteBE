const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
	sequelize.define('Option', {
		id: {
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
			type: DataTypes.INTEGER
		},
        text: {
            allowNull: false,
            type: DataTypes.STRING,
        },
        isCorrect: {
            allowNull: false,
            type: DataTypes.BOOLEAN,
        },
        order: {
            allowNull: false,
            type: DataTypes.INTEGER,
        },
        image: {
            allowNull: true,
            type: DataTypes.BLOB('long'),
        },
    });
};