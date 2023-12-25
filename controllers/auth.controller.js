const sequelize = require('../database/sequelize-initializer');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const login = async function(req, res){
    if(req.session.user){
        res.send(req.session.user)
        return
    }
    if(req.body.username === undefined || req.body.password === undefined){
        res.status(400).send('Bad request')
        return
    }
    const user = await sequelize.models.User.findOne({
        where: {
            username: req.body.username
        }
    })

    if(user){
        const match = await bcrypt.compare(req.body.password, user.password)
        if(match && user.activated){
            req.session.user = user
            res.send(user)
        }else if(!user.activated){
            res.status(401).send('User not activated')
        }
        else{
            res.status(401).send('Incorrect password')
        }
    }else{
        res.status(404).send('User with that username does not exist')
    }
}

const logout = async function(req, res){
    if(!req.session){
        res.status(400).send('Bad request')
        return
    }
    if(!req.session.user){
        res.status(401).send('Not logged in')
        return
    }
    req.session.destroy()
    res.send('Logged out')
}

const register = async function(req, res){
    if(req.body.username === undefined || req.body.email === undefined || req.body.password === undefined){
        res.status(400).send('Bad request')
        return
    }
    const user = await sequelize.models.User.findOne({
        where: {
            email: req.body.email
        }
    })

    if(user){
        res.status(409).send('User with that email already exists')
    }else{
        const hash = await bcrypt.hash(req.body.password, 10)
        const newUser = await sequelize.models.User.create({
            username: req.body.username,
            email: req.body.email,
            password: hash,
            activation_token: crypto.randomBytes(32).toString('hex')
        })
        res.send(newUser)
    }
}

const activate = async function(req, res){
    if(req.params.username === undefined || req.params.token === undefined){
        res.status(400).send('Bad request')
        return
    }
    const user = await sequelize.models.User.findOne({
        where: {
            username: req.params.username,
            activation_token: req.params.token
        }
    })

    if(user){
        user.activated = true
        user.activation_token = null
        await user.save()
        res.send('User activated')
    }else{
        res.status(404).send('User not found')
    }
}

const sendActivationEmail = async function(req, res){
    if(req.body.email === undefined){
        res.status(400).send('Bad request')
        return
    }
    if(req.session.lastSentTimestamp && Date.now() - req.session.lastSentTimestamp < 60000){
        res.status(429).send('Too many requests, please wait 30s')
        return
    }
    const user = await sequelize.models.User.findOne({
        where: {
            email: req.body.email
        }
    })

    if(user){
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        })

        const mailOptions = {
            from: `Quizz World <process.env.EMAIL_USERNAME>`,
            to: user.email,
            subject: 'Account activation',
            text: `Hello ${user.username},\n\nPlease activate your account by clicking the following link:\n\n${process.env.SITE_ADDRESS}/auth/activate/${user.username}/${user.activation_token}`,
            html: require('../email-templates/confirm-email-message')(user)
        }

        transporter.sendMail(mailOptions, (error, info) => {
            if(error){
                console.log(error)
            }else{
                console.log('Email sent: ' + info.response)
            }
        })
        
        req.session.lastSentTimestamp = Date.now()
        res.send('Email sent')
    }else{
        res.status(404).send('User not found')
    }
}

const sendPasswordResetEmail = async function(req, res){
    if(req.body.email === undefined){
        res.status(400).send('Bad request')
        return
    }
    const user = await sequelize.models.User.findOne({
        where: {
            email: req.body.email
        }
    })

    if(user){
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        })

        const mailOptions = {
            from: process.env.EMAIL_USERNAME,
            to: user.email,
            subject: 'Password reset',
            text: `Hello ${user.username},\n\nPlease reset your password by clicking the following link:\n\n${process.env.SITE_ADDRESS}/auth/reset-password/${user.username}/${user.activation_token}`
        }

        transporter.sendMail(mailOptions, (error, info) => {
            if(error){
                console.log(error)
            }else{
                console.log('Email sent: ' + info.response)
            }
        })

        res.send('Email sent')
    }else{
        res.status(404).send('User not found')
    }
}

const resetPassword = async function(req, res){
    if(req.params.username === undefined || req.params.token === undefined || req.body.password === undefined){
        res.status(400).send('Bad request')
        return
    }
    const user = await sequelize.models.User.findOne({
        where: {
            username: req.params.username,
            activation_token: req.params.token
        }
    })

    if(user){
        const hash = await bcrypt.hash(req.body.password, 10)
        user.password = hash
        user.activation_token = null
        await user.save()
        res.send('Password reset')
    }else{
        res.status(404).send('User not found')
    }
}

module.exports = {
    login,
    logout,
    register,
    activate,
    sendActivationEmail,
    sendPasswordResetEmail,
    resetPassword
}