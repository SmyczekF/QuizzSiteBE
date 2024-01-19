const express = require('express')
const router = express.Router()

const  { 
    getAll,
    get,
    createQuiz,
    updateQuiz,
    deleteQuiz 
} = require('../controllers/quiz.controller.js')

router.get('/get/:genreName', getAll)

router.get('/get/:quizID', get)

router.post('/add/', createQuiz) 

router.post('/update/:quizID', updateQuiz) 

router.delete('/delete/:quizID', deleteQuiz)

module.exports = router