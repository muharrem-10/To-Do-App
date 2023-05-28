const express = require('express')
const Task = require('../model/task')
const auth = require('../middleware/auth')
const router = new express.Router()
const {connectDB, disconnectDB} = require('../db/mongoose')

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

router.post('/task', withDB, auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })

    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e)
    }finally {
        await disconnectDB(); // Bağlantıyı kapat
    }
})

router.get('/tasks', withDB, auth, async (req, res) => {
    const match = {}
    const sort ={}

    if(req.query.completed){
        match.completed = req.query.completed === 'true'
    }

    if(req.query.sortBy) {
        const parts = req.query.sortBy.split(":")
        // console.log(parts[0], parts[1])
        sort[parts[0]] = parts[1] === 'asc' ? 1 : -1
    }
    
    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        })
        res.send(req.user.tasks)
    } catch (e) {
        res.status(500).send(e)
    }finally {
        await disconnectDB(); // Bağlantıyı kapat
    }

})


router.patch('/task/:id',withDB ,auth , async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['title', 'completed']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id})

        if (!task) {
            return res.status(404).send()
        }

        updates.forEach((update) => task[update] = req.body[update])
        await task.save()
        res.send(task)
        
    } catch (e) {
        res.status(400).send(e)
    }finally {
        await disconnectDB(); // Bağlantıyı kapat
    }

})

router.delete('/task/:id', withDB, auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })

        if (!task) {
            res.status(404).send()
        }
        res.send(task)
    } catch (e) {
        res.status(500).send()
    }finally {
        await disconnectDB(); // Bağlantıyı kapat
    }
})

module.exports = router