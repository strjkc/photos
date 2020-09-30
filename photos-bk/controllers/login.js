const userRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const User = require('../models/user')
require('dotenv').config()

userRouter.post('/login', async (request, response, next) => {
    const body = request.body
    const user = await  User.findOne({username: body.username})
    const validUser = body.password === null
    ? false
    : await bcrypt.compare(body.password, user.password)
    if (!(user && validUser))
        return response.status(404).json({error: 'Wrong username or password'})
    const userForToken = {
        username: user.username,
        id: user._id
    }
    const token = jwt.sign(userForToken, process.env.SECRET)
    response.send({username: user.username, name: user.name, token})
})

userRouter.post('/create', async (request, response, next) => {
    const body = request.body
    if (!body.password)
        return response.status(400).json({error: 'Password missing'})
    const saltRounds = 10
    const passHash = await bcrypt.hash(body.password, saltRounds)
    const newUser = new User({
        username: body.username,
        name: body.name,
        password: passHash
    })
    const savedUser = await newUser.save()
    response.send({savedUser})
})

module.exports = userRouter