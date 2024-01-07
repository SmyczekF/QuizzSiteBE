const express = require('express')
const router = express.Router()

const  { 
    getTranslations,
} = require('../controllers/translation.controller.js')

router.get('/:routeID/:languageID', getTranslations)

module.exports = router