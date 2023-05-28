const express = require('express')
const User = require('../model/user')
const auth = require('../middleware/auth')
const {connectDB, disconnectDB} = require('../db/mongoose')
const userMeRouter = new express.Router()
const userRouter = new express.Router()


const withDB = (req, res, next) => {
    connectDB() // Bağlantıyı aç
      .then(() => {
        req.db = {
          disconnect: disconnectDB // Bağlantıyı kapatmak için kullanılabilir
        };
        next();
      })
      .catch((error) => {
        res.status(500).send('Veritabanı bağlantısı başarısız oldu');
      });
  };

userRouter.post('/', withDB, async (req, res) => {
    
    const user = new User(req.body)
    try {
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send(e)
        console.log(e)
    }finally {
        await disconnectDB(); // Bağlantıyı kapat
    }
})

userRouter.post('/login', withDB, async (req, res) => {

    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (error) {
        res.status(400).send("Geçersiz e-posta veya şifre." + error)

    }finally {
        await disconnectDB(); // Bağlantıyı kapat
    }
})

userRouter.post('/logout', withDB, auth, async (req, res) => {

    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()
        res.send("Kullanıcı oturumu kapatıldı")
    } catch (e) {
        res.status(500).send(e)
    }finally {
        await disconnectDB(); // Bağlantıyı kapat
    }

})

userMeRouter.get('/', withDB, auth, async (req, res) => {
    try { 
        res.send(req.user)
    } catch (e) {
        res.status(500).send(e)
    }finally {
        await disconnectDB(); // Bağlantıyı kapat
    }
})

userMeRouter.patch('/', withDB, auth, async (req, res) => {

    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }finally {
        await disconnectDB(); // Bağlantıyı kapat
    }
})

userMeRouter.delete('/',withDB, auth, async (req, res) => {

    try {
        await req.user.deleteOne()
        res.send("Kullanıcı silindi")
    } catch (e) {
        res.status(500).send()
    }finally {
        await disconnectDB(); // Bağlantıyı kapat
    }

})

module.exports = {userMeRouter, userRouter}
