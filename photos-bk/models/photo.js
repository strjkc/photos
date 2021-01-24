const mongoose = require('mongoose')

const photo = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: String,
    small: {
        type: String,
        required: true
    },
    medium: {
      type: String,
      required: true
    },
  large: {
    type: String,
    required: true
  },
    isFeatured: Boolean
})

photo.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})


module.exports = mongoose.model('Photo', photo)
