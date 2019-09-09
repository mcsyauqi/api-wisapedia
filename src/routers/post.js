const express = require('express')
const User = require('../models/user')
const Post = require('../models/post')
const auth = require('../middleware/auth')
const upload = require('../services/file-upload')
const aws = require('aws-sdk')

const router = new express.Router()

router.post('/posts', auth, upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.send({
          error: "No file received"
        });
      } 
    else {    
        try {
            const post = new Post({
                ...req.body,
                owner: req.user._id,
                image: req.file.location,
                person: [req.user._id]
            })
            
            await post.save()
            res.status(201).send(post)
        } catch (e) {
            res.status(400).send(e)
            console.log(e)
        }
    }
})

router.get('/posts/me', auth, async (req, res) => {
    try {
        const post = await Post.find({owner: req.user._id})

        if (!post) {
            return res.status(404).send()
        }
        res.send(post)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.get('/posts', auth, async (req, res) => {
    try {
        const post = await Post.find({})

        if (!post) {
            return res.status(404).send()
        }
        res.send(post)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.get('/posts/:postId', auth, async (req, res) => {
    const _id = req.params.postId

    try {
        const post = await Post.findOne({
            _id
            // owner: req.user._id
        })

        if (!post) {
            return res.status(404).send()
        }
        res.send(post)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.patch('/posts/:postId', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpates = ['destination', 'start','finish', 'capacity','route', 'description']
    const isValidOperation = updates.every((update) => allowedUpates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({
            error: 'Invalid updates!'
        })
    }

    try {
        const post = await Post.findOne({
            _id: req.params.postId,
            owner: req.user._id
        })

        if (!post) {
            return res.status(404).send()
        }

        updates.forEach((update) => post[update] = req.body[update])
        await post.save()
        res.send(post)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/posts/:postId', auth, async (req, res) => {
    try {
        const s3 = new aws.S3()

        const deletePostDatabase = await Post.findOne({
            _id: req.params.postId,
            owner: req.user._id
        })

        const params = {
            Bucket: "wisapedia-uploads",
            Key: deletePostDatabase.image.slice(58)
        }

        await s3.deleteObject(params)

        const post = await Post.findOneAndDelete({
            _id: req.params.postId,
            owner: req.user._id
        })

        if (!post) {
            return res.status(404).send()
        }


        res.send({success: "Post deleted Successfully"})
    } catch (e) {
        res.status(404).send(e)
    }
})

router.get('/posts/search/:word', auth, async (req, res) => {
    const search = req.params.word

    try {

        const post = await Post.find({"destination": {$regex: ".*" + search + ".", $options:"i"}})

        if (post.length == 0) {
            return res.status(404).send()
        }

        res.send(post)
    } catch (e) {
        res.status(500).send(e)
    }
})


module.exports = router