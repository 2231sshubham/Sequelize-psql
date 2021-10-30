const express = require('express')
const fileUpload = require('express-fileupload');

const { sequelize, User, Post } = require('./models')

const app = express()
app.use(express.json())
app.use(fileUpload());

app.get("/",(req,res) => {
  res.sendFile(__dirname + "/index.html");
})

app.get('/users', async (req, res) => {
  try {
    const users = await User.findAll()

    return res.json(users)
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: 'Something went wrong' })
  }
})

app.get('/users/:uuid', async (req, res) => {
  const uuid = req.params.uuid
  try {
    const user = await User.findOne({
      where: { uuid },
      include: 'posts',
    })

    return res.json(user)
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: 'Something went wrong' })
  }
})

app.get('/posts', async (req, res) => {
  try {
    const posts = await Post.findAll({ include: 'user' })

    return res.json(posts)
  } catch (err) {
    console.log(err)
    return res.status(500).json(err)
  }
})

app.post('/users', async (req, res) => {
  const { name, email, role } = req.body
  const photo = req.files.photo.data;
  try {
    const user = await User.create({ name, email, role, photo })

    return res.json(user)
  } catch (err) {
    console.log(err)
    return res.status(500).json(err)
  }
})

app.post('/posts', async (req, res) => {
  const { userUuid } = req.body
  const video = req.files.video.data

  try {
    const user = await User.findOne({ where: { uuid: userUuid } })

    const post = await Post.create({ video , userId: user.id })

    return res.json(post)
  } catch (err) {
    console.log(err)
    return res.status(500).json(err)
  }
})

app.delete('/users/:uuid', async (req, res) => {
  const uuid = req.params.uuid
  try {
    const user = await User.findOne({ where: { uuid } })

    await user.destroy()

    return res.json({ message: 'User deleted!' })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: 'Something went wrong' })
  }
})

app.put('/users/:uuid', async (req, res) => {
  const uuid = req.params.uuid
  const { name, email, role } = req.body
  const newPhoto = req.files.photo
  try {
    const user = await User.findOne({ where: { uuid } })

    user.name = name
    user.email = email
    user.role = role
    user.photo = newPhoto

    await user.save()

    return res.json(user)
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: 'Something went wrong' })
  }
})

app.listen({ port: 5000 }, async () => {
  console.log('Server started.')
  await sequelize.authenticate()
  console.log('Database Connected!')
})
