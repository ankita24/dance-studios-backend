const mongoose = require('mongoose')

const options = { discriminatorKey: 'userType' }

const userSchema = mongoose.Schema(
  {
    name: { type: 'string', require: true },
    email: { type: 'string', require: true, unique: true },
    password: { type: 'string', require: true },
    image: { type: 'string' },
    phone: { type: 'number', require: true, unique: true },
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
    lat: { type: 'number', require: true },
    long: { type: 'number', require: true },
    area: { type: 'number' },
    rooms: { type: 'number' },
    availabilty: {
      type: [{ day: 'string', timings: [{ start: Date, end: Date }] }],
    },
    /**
     * TODO: device token unique
     */
    deviceToken: { type: 'string' },
  },
  options
)

const User = mongoose.model('UserSchema', userSchema)

const Owner = User.discriminator('OwnerSchema', ownerSchema)

module.exports = { User, Owner }
