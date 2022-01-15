const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const User = require('./models/user').User
const Owner = require('./models/user').Owner
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const user = require('./models/user')
var distance = require('distance-matrix-api')
const dotenv = require('dotenv')
dotenv.config()

const app = express()

app.use(bodyParser.json())

const password = 'IxoxASPCVY5KKLVz'

const JWT_SECRET = process.env.JWT_SECRET

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
  const user = await User.findOne({ name: username }).lean()
  if (!user) {
    return res.json({ status: 'error', error: 'Invalid username/password' })
  }
  if (await bcrypt.compare(password, user.password)) {
    // const token = jwt.sign(
    //   { id: user._id, username: user.username },
    //   JWT_SECRET
    // )
    return res.json({
      status: 'ok',
      id: user._id,
      type: user.__t === 'OwnerSchema' ? 'owner' : 'user',
    })
  }
  res.json({ status: 'error', error: 'Invalid username/password' })
})

app.post('/api/register', async (req, res) => {
  const { email, name, image, type, password: plainTextPassword } = req.body
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

app.put('/api/owner/:id', (req, res) => {
  try {
    Owner.updateOne({ _id: req.params.id }, req.body)
      .then(() => {
        console.log('Owner details updated')
      })
      .catch(error => {
        console.error(error)
        throw error
      })
  } catch (error) {
    console.error(error)
    // if (error.code === 11000) {
    //   return res.json({ status: 'error', error: 'Username already in use!' })
    // }
    throw error
  }
  res.send({ status: 'ok' })
})

app.get('/api/profile/:id', async (req, res) => {
  console.log(req.params.id)
  try {
    const user = await User.findOne({ _id: req.params.id }).select('-password')
    console.log(user)
    return res.send({ status: 'ok', user })
  } catch (error) {
    console.error(error)
    // if (error.code === 11000) {
    //   return res.json({ status: 'error', error: 'Username already in use!' })
    // }
    throw error
  }
})

app.get('/api/studios', async (req, res) => {
  const { lat, long } = req.query
  try {
    let data = []
    const studios = await User.find({ __t: 'OwnerSchema' }).select('-password')
    /**
     * TODO: Keep the API key environment variable
     */

    distance.key(process.env.DISTANCE_MATRIX_KEY)
    distance.units('imperial')
    studios.forEach(item => {
      if ((lat && long && item.lat && item, long)) {
        let path = 0
        const origins = [`${lat},${long}`]
        const destinations = [`${item.lat},${item.long}`]
        distance.matrix(origins, destinations, function (err, distances) {
          if (err) {
            return console.log(err)
          }
          if (!distances) {
            return console.log('no distances')
          }
          if (distances.status == 'OK') {
            for (var i = 0; i < origins.length; i++) {
              for (var j = 0; j < destinations.length; j++) {
                if (distances.rows[0].elements[j].status == 'OK') {
                  path = distances.rows[i].elements[j].distance.text
                }
              }
            }
          }
        })
        data.push({
          ...item._doc,
          distance: path,
        })
      }
    })
    console.log(data)
    res.send({
      status: 'ok',
      data: data.sort((a, b) => a.distance - b.distance),
    })
  } catch (err) {
    console.error(err)

    throw err
  }
})

app.listen(9999, () => {
  console.log(`Listening to 9999`)
})
