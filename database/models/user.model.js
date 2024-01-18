const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
	sequelize.define('User', {
		id: {
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
			type: DataTypes.INTEGER
		},
		username: {
			allowNull: false,
			type: DataTypes.STRING,
			unique: true,
			validate: {
				is: /^\w{3,}$/
			}
		},
		email: {
			allowNull: false,
			type: DataTypes.STRING,
			unique: true,
			validate: {
				isEmail: true
			}
		},
		password: {
			allowNull: false,
			type: DataTypes.STRING
		},
		activated: {
			allowNull: false,
			type: DataTypes.BOOLEAN,
			defaultValue: false
		},
		activation_token: {
			allowNull: true,
			type: DataTypes.STRING
		},
    
	});
};