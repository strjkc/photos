const photosRouter = require('express').Router()
const Photo = require('../models/photo')
const multer = require('multer')
const helpers = require('./helpers')

var uploads = multer({ storage: multer.memoryStorage() })


photosRouter.get('/', async (request, response) => {
    const photos = await Photo.find({})
    response.send(photos)
})

photosRouter.get('/:id', async (request, response) => {
    const id = request.params.id
    const photo = await Photo.findById(id)
    response.send(photo)
})

photosRouter.get('/download/:id', async (request, response) => {
    const photo = await Photo.findById(request.params.id)
    console.log(photo)
    response.download(`uploads/${photo.name}`)
})

photosRouter.delete('/:id', async (request, response) => {
    try{
        const id = request.params.id
        const photo = await Photo.findById(id)
        helpers.removePhoto(photo)
      await Photo.findOneAndRemove({_id: id})
      response.status(204).json({msg: 'Photo removed'})
    }catch(error) {
        console.log(error)
    }
})

photosRouter.put('/:id', async (request, response) => {
    try{
        const id = request.params.id
        const note = {...request.body, isFeatured: !request.body.isFeatured}
        const savedPhoto = await Photo.findByIdAndUpdate(id, note, {new: true})
        console.log('saved photo', savedPhoto)
        response.send(savedPhoto)
    }catch(error){
        console.log(error)
    }
})

photosRouter.post('/', uploads.single('image'), async (req,res) => {
    const file = req.file
    const a = [{prefix: 'small', size: [400, 500]}, {prefix: 'medium', size: [1366, 768]}, {prefix: 'large', size: []} ]
    helpers.resizeMultiple(file.buffer,a, file.originalname)
    const newPhoto = new Photo({
        name: file.originalname,
        description: req.body.description || '',
        small: `https://photos-gallery.s3.eu-central-1.amazonaws.com/small_${req.file.originalname}`,
        medium: `https://photos-gallery.s3.eu-central-1.amazonaws.com/medium_${req.file.originalname}`,
        large: `https://photos-gallery.s3.eu-central-1.amazonaws.com/large_${req.file.originalname}`,
        isFeatured: req.body.isFeatured || false
    })
    const savedPhoto = await newPhoto.save()
    
    res.json({msg: 'Created'})
})

module.exports = photosRouter
