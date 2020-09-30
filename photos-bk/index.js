const express = require('express')
require('express-async-errors')
const cors = require('cors')
const userRouter = require('./controllers/login')
const photosRouter = require('./controllers/photos')
const mongoose = require('mongoose')
const middleweare = require('./middleweare')

const app = express()
const dbUrl = process.env.DBURL
mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(
        () => console.log('Connected to database')
    )
app.use(express.static('build'))
app.use(cors())
app.use(express.json())
app.use(express.static('uploads'))
app.use('/users', userRouter)
app.use('/photos', photosRouter)

app.use(middleweare.errorHandler)

app.listen(5000, () => console.log(`app listening on port 500`))