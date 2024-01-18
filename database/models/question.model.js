const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
	sequelize.define('Question', {
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
        image: {
            allowNull: true,
            type: DataTypes.BLOB('long'),
        },
        type: {
            allowNull: false,
            type: DataTypes.STRING,
        },
        order: {
            allowNull: false,
            type: DataTypes.INTEGER,
        },
    });
};