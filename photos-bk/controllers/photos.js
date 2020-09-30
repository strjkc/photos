const photosRouter = require('express').Router()
const path = require('path')
const fs = require('fs')
const multer = require('multer')
const Photo = require('../models/photo')
const sharp = require('sharp')

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads')
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname)
    }
})

const uploads = multer({storage})

photosRouter.get('/', async (request, response) => {
    const photos = await Photo.find({})
    response.send(photos)
})

photosRouter.get('/:id', async (request, response) => {
    const id = request.params.id
    const photo = await Photo.findById(id)
    response.send(photo)
})

photosRouter.delete('/:id', async (request, response) => {
    try{
        const id = request.params.id
        await Photo.findOneAndRemove({_id: id})
        response.status(204).json({msg: 'Photo removed'})
    }catch(error) {
        console.log(error)
    }
})

photosRouter.put('/:id', async (request, response) => {
    try{
        const id = request.params.id
        const currentValue = request.body.isFeatured
        const savedPhoto = await Photo.findByIdAndUpdate(id, {isFeatured: !currentValue}, {new: true})
        console.log('saved photo', savedPhoto)
        response.send(savedPhoto)
    }catch(error){
        console.log(error)
    }
})

photosRouter.post('/', uploads.single('image'), async (request,response) => {
    const imageName = request.file.path.substring(8)
    
    sharp(request.file.path)
        .resize(500,400)
        .toFile(`uploads/thumbnails/${'thumb_'+request.file.originalname}`, (err, info) => console.log(err, info))
    const newPhoto = new Photo({
        name: imageName,
        description: request.body.description || '',
        thumbnail: `/thumbnails/${'thumb_'+request.file.originalname}`,
        isFeatured: request.body.isFeatured || false
    })
    const savedPhoto = await newPhoto.save()
    
    response.json({msg: 'Created'})
})

module.exports = photosRouter