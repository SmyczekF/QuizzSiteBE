const sequelize = require('../database/sequelize-initializer');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const getUsers = async function(req, res){
    sequelize.models.User.findAll().then(users => {
        res.send(users)
    })
}

const getUser = async function(req, res){
    sequelize.models.User.findOne({
        where: {
            id: req.params.userID
        }
    }).then(user => {
        res.send(user)
    })
}

const createUser = async function(req, res){
    const user = await sequelize.models.User.findOne({
        where: {
            email: req.body.email
        }
    })

    if(user){
        res.status(409).send('User with that email already exists')
    }else{
        const hash = await bcrypt.hash(req.body.password, 10)
        const token = crypto.randomBytes(32).toString('hex')
        const newUser = await sequelize.models.User.create({
            username: req.body.username,
            email: req.body.email,
            password: hash,
            activated: req.body.activated || false,
            activation_token: token
        })
        res.send(newUser)
    }
}

const updateUser = async function(req, res){
    sequelize.models.User.update({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
    }, {
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