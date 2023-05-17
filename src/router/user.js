const express = require('express')
const User = require('../model/user')
const router = new express.Router()

// prefix routes ekle
// db close open kur !!!
// token add
// authentication add
// auth folder add
// security add security
// 


router.post('/user', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        res.status(201).send({ user })
    } catch (e) {
        res.status(400).send(e)
        console.log(e)
    }
})

router.get('/users', async (req, res) => {
    try {
        const users = await User.find({})
        res.send(users)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.get('/user/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        res.send(user)
    } catch (e) {
        res.status(404).send(e)
    }
})

router.patch('/users/:id', async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const user = await User.findOne({ _id: req.params.id})

        if (!user) {
            return res.status(404).send("kullanıcı bulunamadı")
        }

        updates.forEach((update) => user[update] = req.body[update])
        await user.save()
        res.send(user)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findOneAndDelete({ _id: req.params.id})

        if (!user) {
            res.status(404).send("kullanıcı bulunamadı")
        }

        res.send(user)
    } catch (e) {
        res.status(500).send()
    }
})

router.delete('/users', async (req, res) => {
    try {
        const user = await User.deleteMany({ })

        res.send(user)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router