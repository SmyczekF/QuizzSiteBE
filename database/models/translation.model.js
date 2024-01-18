const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
	sequelize.define('Translation', {
		id: {
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
			type: DataTypes.INTEGER
		},
        en: {
            allowNull: true,
            type: DataTypes.STRING,
        },
        fr: {
            allowNull: true,
            type: DataTypes.STRING,
        },
        es: {
            allowNull: true,
            type: DataTypes.STRING,
        },
        de: {
            allowNull: true,
            type: DataTypes.STRING,
        },
        it: {
            allowNull: true,
            type: DataTypes.STRING,
        },
        ru: {
            allowNull: true,
            type: DataTypes.STRING,
        },
        pl: {
            allowNull: true,
            type: DataTypes.STRING,
        },
    });
};