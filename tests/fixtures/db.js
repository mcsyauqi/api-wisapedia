const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const User = require('../../src/models/user')
const Post = require('../../src/models/post')

const userOneId = new mongoose.Types.ObjectId()
const userOne = {
    _id: userOneId,
    name: 'Ahmad',
    email: 'ahmad@gmail.com',
    password: 'ahmadthariq',
    tokens: [{
        token: jwt.sign({
            _id: userOneId
        }, process.env.JWT_SECRET)
    }]
}

const userTwoId = new mongoose.Types.ObjectId()
const userTwo = {
    _id: userTwoId,
    name: 'thariq',
    email: 'thariq@gmail.com',
    password: 'thariqsyauqi',
    tokens: [{
        token: jwt.sign({
            _id: userTwoId
        }, process.env.JWT_SECRET)
    }]
}

const postOne = {
    _id: new mongoose.Types.ObjectId(),
    destination: 'Pantai Parangtritis',
    description: 'Ayo jalan-jalan',
    completed: false,
    route: 'Bantul-Sleman',
    capacity: 5,
    start: '2019-05-18T16:00:00.000Z',
    finish: '2019-05-18T16:00:00.000Z',
    owner: userOne._id
}

const postTwo = {
    _id: new mongoose.Types.ObjectId(),
    destination: 'Pantai Pangandaran',
    description: 'Ayo jalan',
    completed: false,
    route: 'Jogja-Cilacap',
    capacity: 5,
    start: '2019-05-18T16:00:00.000Z',
    finish: '2019-05-18T16:00:00.000Z',
    owner: userOne._id
}

const postThree = {
    _id: new mongoose.Types.ObjectId(),
    destination: 'Pantai Nglambor',
    description: 'Ayo jalan',
    completed: false,
    route: 'Jogja-Cilacap',
    capacity: 5,
    start: '2019-05-18T16:00:00.000Z',
    finish: '2019-05-18T16:00:00.000Z',
    owner: userTwo._id
}

const setupDatabase = async () => {
    await User.deleteMany()
    await Post.deleteMany()
    await new User(userOne).save()
    await new User(userTwo).save()
    await new Post(postOne).save()
    await new Post(postTwo).save()
    await new Post(postThree).save()
}

module.exports = {
    userOneId,
    userOne,
    userTwoId,
    userTwo,
    postOne,
    postTwo,
    postThree,
    setupDatabase
}