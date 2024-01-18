const express = require('express')
const router = express.Router()

const  { 
    getAll,
    get,
    createQuiz,
    updateQuiz,
    deleteQuiz 
} = require('../controllers/quiz.controller.js')

router.get('/get/', getAll)

router.get('/get/:quizID', get)

router.post('/add/', createQuiz) 

router.put('/update/:quizID', updateQuiz) 

router.delete('/delete/:quizID', deleteQuiz)

module.exports = router