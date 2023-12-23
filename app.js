const express = require('express')
const app = express()
require('dotenv').config()

const sequelize = require('./database/sequelize-initializer');

sequelize.sync().then(() => {
  console.log(`Database & tables created!`)
})

app.use('/', express.static('build'))
app.get('/api', (req, res) => res.send('Hello World!'))

app.listen(8080, () => console.log('Example app listening on port 8080!'))