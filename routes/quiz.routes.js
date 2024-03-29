const express = require('express')
const router = express.Router()

const  { 
    getAll,
    get,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    validateAnswers
} = require('../controllers/quiz.controller.js')

router.get('/get/genre/:genreName', getAll)

router.get('/get/:quizID', get)

router.post('/add/', createQuiz) 

router.post('/update/:quizID', updateQuiz) 

router.delete('/delete/:quizID', deleteQuiz)

router.post('/finish/:quizID', validateAnswers)

module.exports = router