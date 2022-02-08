const mongoose = require('mongoose')

const options = { discriminatorKey: 'userType' }

const userSchema = mongoose.Schema(
  {
    name: { type: 'string', require: true },
    email: { type: 'string', require: true, unique: true },
    password: { type: 'string', require: true },
    image: { type: 'string' },
  },
  {
    collections: 'users',
  },
  options
)

const ownerSchema = mongoose.Schema(
  {
    location: { type: 'string' },
    images: { type: ['string'] },
    cost: { type: 'number' },
    duration: { type: 'number' },
    sqFeet: { type: 'number' },
    soundProof: { type: 'boolean' },
    lat: { type: 'number' },
    long: { type: 'number' },
    area: { type: 'number' },
    rooms: { type: 'number' },
    availabilty: {
      type: [{ day: 'string', timings: [{ start: Date, end: Date }] }],
    },
  },
  options
)

const User = mongoose.model('UserSchema', userSchema)

const Owner = User.discriminator('OwnerSchema', ownerSchema)

module.exports = { User, Owner }
