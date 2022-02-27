const mongoose = require('mongoose')

const bookingSchema = mongoose.Schema({
  studioId: { type: 'string', require: true },
  userId: { type: 'string', require: true },
  slot: { type: 'string', require: true },
  price: { type: 'string', require: true },
})

const Booking = mongoose.model('BookingSchema', bookingSchema)

module.exports = { Booking }
