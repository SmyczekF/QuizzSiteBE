const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DB_CONNECTION)

const modelDefiners = [
    require('./models/user.model'),
];

for (const modelDefiner of modelDefiners) {
    modelDefiner(sequelize);
}

// We execute any extra setup after the models are defined, such as adding associations.
// applyExtraSetup(sequelize);

// We export the sequelize connection instance to be used around our app.
module.exports = sequelize;

