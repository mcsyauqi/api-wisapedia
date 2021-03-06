const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
    destination: {
        type: String,
        required: true,
        trim: true
    },
    start: {
        type: Date,
        required: true,
    },
    finish: {
        type: Date,
        required: true,
    },   
    capacity: {
        type: Number,
        required: true,
    },
    route: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    image: {
        type: String
    },
    wa: {
        type: Number,
    },
    budget: {
        type: Number,
    }
}, {
    timestamps: true
})

const Post = mongoose.model('Post', postSchema)

module.exports = Post