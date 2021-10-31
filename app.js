const express = require('express')
const path = require('path')
const fileUpload = require('express-fileupload');

const { sequelize, User, Post } = require('./models')

const app = express()
app.use(express.json())

app.use(fileUpload({
  createParentPath: true,
  abortOnLimit: true}))

app.use(express.static("./uploads"));
app.set('view engine', 'ejs');


// ```````````````````````` HOME_get ```````````````//

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

// ```````````````````````` USERS_get_one (used binary data here to store and display image) ```````````````//

app.get('/users/:uuid', async (req, res) => {
  const uuid = req.params.uuid
  try {
    const user = await User.findOne({
      where: { uuid },
      include: 'posts',
    })
    const pic = user.photo.toString('base64');
    return res.render("photo",{pic:pic});
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: 'Something went wrong' })
  }
})


// ```````````````````````` POSTS_get ```````````````//

app.get('/posts/:uuid', async (req, res) => {
  const uuid = req.params.uuid
  try {
    const post = await Post.findOne({
      where: {uuid},
      include: 'user'
    })

    return res.redirect(post.url)
  } catch (err) {
    console.log(err)
    return res.status(500).json(err)
  }
})


// ```````````````````````` USERS_post ```````````````//

app.post('/users', async (req, res) => {
  const { name, email, role } = req.body
  const {photo} = req.files;
  const pic = photo.data;
  try {
    const user = await User.create({ name, email, role,photo:pic})

    return res.json(user)
  } catch (err) {
    console.log(err)
    return res.status(500).json(err)
  }
})


// ```````````````````````` POSTS_post ```````````````//

app.post('/posts', async (req, res) => {
  const { userUuid } = req.body
  const {video} = req.files

  try {
    await video.mv(__dirname + "\\uploads\\upload_video\\" + video.name+path.extname(video.name));
    let url = `http://localhost:5000//upload_video/${video.name}` + path.extname(video.name)
    const user = await User.findOne({ where: { uuid: userUuid } })
    const post = await Post.create({ url , userId: user.id })

    return res.json(post)
  } catch (err) {
    console.log(err)
    return res.status(500).json(err)
  }
})


// ```````````````````````` DELETE ```````````````//

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


// ```````````````````````` UPDATE ```````````````//

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


// ```````````````````````` LISTEN ```````````````//

app.listen({ port: 5000 }, async () => {
  console.log('Server started.')
  await sequelize.authenticate()
  console.log('Database Connected!')
})
