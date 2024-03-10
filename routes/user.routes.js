const express = require('express')
const router = express.Router()

const  { 
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
} = require('../controllers/user.controller.js')

router.get('/', getUsers)

router.get('/:userID', getUser)

router.post('/', createUser) 

router.post('/:userID', updateUser) 

router.delete('/:userID', deleteUser)

module.exports = router