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
    password: {
      allowNull: false,
      type: DataTypes.STRING
    },
    
	},
  {
    freezeTableName: true,
  });
};