const express = require('express')
const {userMeRouter, userRouter} = require('./router/user')
const taskRouter = require('./router/task')


const app = express()

app.use(express.json())

app.use('/user', userRouter)
app.use('/user/me', userMeRouter)
app.use(taskRouter)

module.exports = app