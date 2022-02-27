const mongoose = require('mongoose')

const bookingSchema = mongoose.Schema({
  studioId: { type: 'string', require: true },
  userId: { type: 'string', require: true },
  slot: { type: 'string', require: true },
  price: { type: 'number', require: true },
  studioDetails: {
    name: { type: 'string', require: true },
    email: { type: 'string', require: true },
    location: { type: 'string', require: true },
  },
  userDetails: {
    name: { type: 'string', require: true },
    email: { type: 'string', require: true },
  },
})

const Booking = mongoose.model('BookingSchema', bookingSchema)

module.exports = { Booking }
