const express = require('express')
const app = express()
require('dotenv').config()
const session = require('express-session');
const bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true, maxAge: 60000 }
}));

const sequelize = require('./database/sequelize-initializer');


sequelize.sync().then(() => {
  console.log(`Database & tables created!`)
})

app.use('/', express.static('build'))
app.use('/users', require('./routes/user.routes'))
app.get('/api', (req, res) => res.send('Hello World!'))

app.listen(8080, () => console.log('Example app listening on port 8080!'))