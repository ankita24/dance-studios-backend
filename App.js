const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const User = require('./models/user').User
const Owner = require('./models/user').Owner
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

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
    let response
    if (type === 'user') {
      response = await User.create({ email, name, password, image })
      console.log('User created successfully', response)
    } else {
      response = await Owner.create({ email, name, password, image })
      console.log('Owner created successfully', response)
    }
    res.json({ status: 'ok', response })
  } catch (error) {
    console.error(error)
    // if (error.code === 11000) {
    //   return res.json({ status: 'error', error: 'Username already in use!' })
    // }
    throw error
  }
  //res.json({ status: 'ok' })
})

app.put('/api/owner/:id', (req, res, next) => {
  Owner.updateOne({ _id: req.params.id }, req.body)
    .then(() => {
      console.log('Owner details updated')
    })
    .catch(error => {
      console.error(error)
      throw error
    })
  res.send({ status: 'ok' })
})

app.listen(9999, () => {
  console.log(`Listening to 9999`)
})
