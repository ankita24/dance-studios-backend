var mongoose = require('mongoose')

var imageSchema = new mongoose.Schema(
  {
    name: { type: 'string', require: true },
    originalName: { type: 'string', require: true, unique: true },
    data: Buffer,
    contentType: { type: 'string', require: true, },
  },
  { collections: 'images' }
)

const model = new mongoose.model('ImageSchema', imageSchema)
module.exports = model
