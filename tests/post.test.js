const request = require('supertest')
const app = require('../src/app')
const Post = require('../src/models/post')
const {
    userOneId,
    userOne,
    userTwoId,
    userTwo,
    postOne,
    postTwo,
    postThree,
    setupDatabase
} = require('./fixtures/db')

beforeEach(setupDatabase)

test('Should create post for user', async () => {
    const response = await request(app)
        .post('/posts')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .field('destination', 'Pantai Parangtritis')
        .field('description', 'Ayo jalan-jalan')
        .field('route', 'Bantul-Sleman')
        .field('person', '5')
        .field('start', '2019-05-18T16:00:00.000Z')
        .field('finish', '2019-05-18T16:00:00.000Z')
        .attach('image', 'tests/fixtures/profile-pic.jpg')
        .expect(201)

    const post = await Post.findById(response.body._id)
    expect(post).not.toBeNull()
    expect(post.completed).toEqual(false)
})

test('Should get user posts', async () => {
    const response = await request(app)
        .get('/posts')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    expect(response.body.length).toEqual(3)
})

test('Should not delete other user posts', async () => {
    await request(app)
        .delete(`/posts/${postOne._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(404)

    const post = await Post.findById(postOne._id)
    expect(post).not.toBeNull()
})