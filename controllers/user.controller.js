const sequelize = require('../database/sequelize-initializer');

const getUsers = async function(req, res){
    sequelize.models.User.findAll().then(users => {
        res.send(users)
    })
}

const getUser = async function(req, res){
    sequelize.models.User.findByPk(req.params.userID).then(user => {
        res.send(user)
    })
}

const createUser = async function(req, res){
    sequelize.models.User.create(req.body).then(user => {
        res.send(user)
    })
}

const updateUser = async function(req, res){
    sequelize.models.User.update(req.body, {
        where: {
            id: req.params.userID
        }
    }).then(user => {
        res.send(user)
    })
}

const deleteUser = async function(req, res){
    sequelize.models.User.destroy({
        where: {
            id: req.params.userID
        }
    }).then(user => {
        res.send(user)
    })
}

module.exports = {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser
}