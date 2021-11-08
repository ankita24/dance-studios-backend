const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const User = require('./models/user').User
const Owner = require('./models/user').Owner
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
var multer = require('multer')
var imgModel = require('./models/image')
var fs = require('fs')

const app = express()

app.use(bodyParser.json())

const password = 'IxoxASPCVY5KKLVz'

const JWT_SECRET = 'dsfjvdfhgsjhfbsdjhfb$^%%&jhbdfhjbdfbfgdhvdjbkjdsbf'

mongoose.connect(
  `mongodb+srv://ankita:${password}@studio.ituqd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  }
)

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '/Users/ankitapanigrahi/Documents/uploads')
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now())
  },
})

var upload = multer({ storage: storage })

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body
  const user = await User.findOne({ username }).lean()
  if (!user)
    return res.json({ status: 'error', error: 'Invalid username/password' })
  if (await bcrypt.compare(password, user.password)) {
    console.log('aya')
    const token = jwt.sign(
      { id: user._id, username: user.username },
      JWT_SECRET
    )
    return res.json({ status: 'ok', data: token })
  }
  res.json({ status: 'error', error: 'Invalid username/password' })
})

app.post('/api/register', async (req, res) => {
  const { email, name, image, type, password: plainTextPassword } = req.body
  console.log(req.body)
  const password = await bcrypt.hash(plainTextPassword, 10)
  if (!email || typeof email !== 'string') {
    return res.json({ status: 'error', error: 'Invalid email' })
  }

  if (!name || typeof name !== 'string') {
    return res.json({ status: 'error', error: 'Invalid name' })
  }
  if (!plainTextPassword || typeof plainTextPassword !== 'string') {
    return res.json({ status: 'error', error: 'Invalid password' })
  }
  if (plainTextPassword.length < 5) {
    return res.json({
      status: 'error',
      error: 'Password too small. Should be atleast 6 characters',
    })
  }
  try {
    if (type === 'user') {
      const response = await User.create({ email, name, password, image })
      console.log('User created successfully', response)
    } else {
      const response = await Owner.create({ email, name, password, image })
      console.log('Owner created successfully', response)
    }
  } catch (error) {
    console.error(error)
    // if (error.code === 11000) {
    //   return res.json({ status: 'error', error: 'Username already in use!' })
    // }
    throw error
  }
  res.json({ status: 'ok' })
})

app.post('/api/imageUpload', upload.single('photo'), (req, res, next) => {
  var obj = {
    name: req.file.filename,
    originalName: req.file.originalname,
    data: fs.readFileSync(
      path.join('/Users/ankitapanigrahi/Documents/uploads/' + req.file.filename)
    ),
    contentType: 'image/png',
  }

  imgModel.create(obj, (err, item) => {
    if (err) {
      return res.json({ status: 'error', error: 'Error Uploading image' })
    } else {
      // item.save();
      return res.json({ data: item.originalName })
    }
  })
})

app.listen(9999, () => {
  console.log(`Listening to 9999`)
})
