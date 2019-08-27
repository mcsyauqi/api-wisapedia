const express = require('express')
const User = require('../models/user')
const Post = require('../models/post')
const auth = require('../middleware/auth')
const upload = require('../services/file-upload')
const aws = require('aws-sdk')
const {
    sendWelcomeEmail,
    sendCancelationEmail
} = require('../emails/account')

const router = new express.Router()


router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        sendWelcomeEmail(user.email, user.name, user._id.toString().slice(19))
        const token = await user.generateAuthToken()
        res.status(201).send({
            user,
            token
        })
    } catch (e) {
        res.status(400).send(e)
        console.log(e)
    }
})

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({
            user,
            token
        })
    } catch (e) {
        res.status(400).send()
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()
        res.send({success: "Logout success!"})
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send({success: "Logout all success!"})
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    req.user.avatar = req.file.location
    await req.user.save()
    res.send({'avatar': req.file.location})
}, (error, req, res, next) => {
    res.status(400).send({
        error: error.message
    })
})

router.delete('/users/me/avatar', auth, async (req, res) => {
    try {
        if (!req.user.avatar) {
            return res.status(404).send('Avatar not found')
        }

        const s3 = new aws.S3()

        const params = {
            Bucket: "wisapedia-uploads",
            Key: req.user.avatar.slice(58)
        }

        try {
            await s3.deleteObject(params).promise()
        }
        catch (err) {
            res.send({error: "ERROR in file Deleting : " + JSON.stringify(err)})
        }

            req.user.avatar = undefined

            await req.user.save()
            res.send({success: "File deleted successfully"})
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/users/bookmarks/:postId', auth, async (req, res) => {

    const postId = req.params.postId

    try {
        const user = await User.findById(req.user._id)

        await user.bookmarks.push(postId);
        
        user.save()
        res.status(200).send(user)
    } catch (e) {
        res.status(400).send(e)
        console.log(e)
    }
})

router.post('/users/trips/:postId', auth, async (req, res) => {

    const postId = req.params.postId

    try {
        const user = await User.findById(req.user._id)

        await user.trips.push(postId);
        
        user.save()
        res.status(200).send(user)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.get('/users/bookmarks', auth, async (req, res) => {

    try {
        const user = await User.findById(req.user._id)

        if (user.bookmarks.length == 0) {
            return res.status(404).send({error: "No bookmarks found!"})
        }

        const post = await Post.find({
            _id: user.bookmarks
        })
    
        res.send(post)
    } catch (e) {
        res.status(400).send(e)
        console.log(e)
    }
})

router.delete('/users/bookmarks/:postId', auth, async (req, res) => {

    const postId = req.params.postId

    try {
        const user = await User.findById(req.user._id)

        user.bookmarks =  await user.bookmarks.filter(item => item !== postId)

        var remain = user.bookmarks.filter(function(value, index, arr){

            return value != postId;
        
        });

        user.bookmarks = remain

        user.save()
        res.status(200).send(user)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.get('/users/trips', auth, async (req, res) => {

    try {
        const user = await User.findById(req.user._id)

        if (user.trips.length == 0) {
            return res.status(404).send()
        }

        const post = await Post.find({
            _id: user.trips
        })
    
        res.send(post)
    } catch (e) {
        res.status(400).send(e)
        console.log(e)
    }
})

router.delete('/users/trips/:postId', auth, async (req, res) => {

    const postId = req.params.postId

    try {
        const user = await User.findById(req.user._id)

        user.trips =  await user.trips.filter(item => item !== postId)

        var remain = user.trips.filter(function(value, index, arr){

            return value != postId;
        
        });

        user.trips = remain

        user.save()
        res.status(200).send(user)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.get('/users/:userId/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)

        if (!user || !user.avatar) {
            throw new Error()
        }

        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch (e) {
        res.status(404).send()
    }
})

router.get('/users/me', auth, async (req, res) => {
    try {
        const me = await User.findById(req.user._id)

        res.send(me)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.get('/users/:userId', auth, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)

        if (!user) {
            return res.status(404).send()
        }
        res.send(user)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpates = ['name', 'email', 'password', 'number', 'birthday']
    const isValidOperation = updates.every((update) => allowedUpates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({
            error: 'Invalid updates!'
        })
    }

    try {
        updates.forEach((update) => req.user[update] = req.body[update])

        await req.user.save()

        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove()
        sendCancelationEmail(req.user.email, req.user.name)
        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/users/verifyme/:verificationCode', auth, async (req, res) => {


    const verificationCode = req.params.verificationCode

    try {
        if (req.user._id.toString().slice(19) == verificationCode) {
            const user = await User.findById(req.user._id);

            user.verified = true;

            user.save()
            res.status(200).send({succes: "Verified successfully!"})
        } else {
            res.send({error: "Wrong verification code!"})
        }
    } catch (e) {
        res.status(400).send(e)
    }
})

module.exports = router