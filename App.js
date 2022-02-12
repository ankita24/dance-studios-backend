const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const User = require('./models/user').User
const Owner = require('./models/user').Owner
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const user = require('./models/user')
const dotenv = require('dotenv')
var axios = require('axios')
const dayjs = require('dayjs')

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
      user,
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
      console.log('User created successfully!', response)
    } else {
      response = await Owner.create({ email, name, password, image })
      console.log('Owner created successfully!', response)
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
  try {
    const user = await User.findOne({ _id: req.params.id }).select('-password')
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
    let promise = []
    studios.forEach(item => {
      if (!!lat && !!long && !!item.lat && !!item.long) {
        var config = {
          method: 'get',
          url: `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${lat},${long}&destinations=${item.lat},${item.long}&units=imperial&key=${process.env.DISTANCE_MATRIX_KEY}`,
          headers: {},
        }
        promise.push(
          axios(config)
            .then(function (response) {
              let distance = response.data.rows[0].elements[0].distance?.value
              let timeToReach =
                response.data.rows[0].elements[0].duration?.value
              if (!!distance && !!duration)
                data.push({
                  ...item._doc,
                  distance: distance / 1000,
                  timeToReach: timeToReach,
                })
            })
            .catch(function (error) {
              console.error(error)
            })
        )
      }
    })
    Promise.all(promise).then(() => {
      res.send({
        status: 'ok',
        data: data.sort((a, b) => a.distance - b.distance),
      })
    })
  } catch (err) {
    console.error(err)

    throw err
  }
})

app.get('/api/studio/:id', async (req, res) => {
  try {
    /**
     * TODO: Change the order of days monday and sunday
     */
    const weekdays = [
      'Monday',
      'Sunday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ]
    const { id } = req.params
    const studioDetails = await Owner.find({ _id: id }).select('-password')
    const today = new Date()

    const todaySlots = studioDetails[0].availabilty.find(
      item => item.day === weekdays[today.getDay()]
    ).timings
    const slots = []
    todaySlots.forEach(item => {
      const start = dayjs(new Date(item.start))
      const end = dayjs(new Date(item.end))
      let slot1 = start
      let slot2 = start.add(1, 'h')
      while (slot2 <= end) {
        slots.push(`${slot1.format('hh:mm')}-${slot2.format('hh:mm')}`)
        slot1 = slot2
        slot2 = slot2.add(1, 'h')
      }
    })
    console.log(slots)

    res.send({ status: 'ok' })
  } catch (e) {
    console.error(e)
  }
})

app.listen(9999, () => {
  console.log(`Listening to 9999`)
})
