const express = require('express')
const app = express()
require('dotenv').config()
const session = require('express-session');
const bodyParser = require('body-parser')
const cors = require('cors')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24}
}));

// development only
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

const sequelize = require('./database/sequelize-initializer');

sequelize.sync({force: true}).then(() => {
  console.log(`Database & tables created!`)
})

app.use('/', express.static('build'))
app.use('/users', require('./routes/user.routes'))
app.use('/auth', require('./routes/auth.routes'))
app.use('/translations', require('./routes/translation.routes'))
app.use('/quizz', require('./routes/quiz.routes'))

app.listen(8080, () => console.log('Example app listening on port 8080!'))