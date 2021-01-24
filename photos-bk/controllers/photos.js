const photosRouter = require('express').Router()
const path = require('path')
const fs = require('fs')
const Photo = require('../models/photo')
const sharp = require('sharp')
const AWS = require('aws-sdk')
const {Readable} = require('stream')
const multer = require('multer')
s3 = new AWS.S3({apiVersion: '2006-03-01'});
AWS.config.update({accessKeyId: 'AKIAWGY4ISEAZB4XWKIW', secretAccessKey: '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' , region: 'eu-central-1'});

// call S3 to retrieve upload file to specified bucket
var uploadParams = {Bucket: 'photos-gallery', Key: '', Body: ''}
//

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
        await Photo.findOneAndRemove({_id: id})
        fs.unlinkSync(`/home/strahinja/Documents/projects/photos-bk/uploads/${photo.name}`)
        fs.unlinkSync(`/home/strahinja/Documents/projects/photos-bk/uploads/${photo.thumbnail}`)
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
    console.log(req.file)
    const file = req.file
    const readable = new Readable()
    readable._read = () => {} 
    readable.push(file.buffer)
    readable.push(null)
    sharp(file.buffer)
    .resize(500,400)
    .toBuffer()
    .then(async data => {
        const rStream = new Readable()
        rStream._read = () => {}
        rStream.push(data)
        rStream.push(null)
        const wStream = fs.createWriteStream(`small_${file.originalname}`, {encoding: 'base64'})
        uploadParams.Body = rStream
        uploadParams.Key = path.basename(`small_${file.originalname}`);
        await s3.upload (uploadParams, function (err, data) {
            if (err) {
              console.log("Error", err);
            } if (data) {
              console.log("Upload Success", data.Location);
            }
          });
    })
    sharp(file.buffer)
    .resize(1366,768)
    .toBuffer()
    .then(async data => {
        const rStream = new Readable()
        rStream._read = () => {}
        rStream.push(data)
        rStream.push(null)
        const wStream = fs.createWriteStream(`med_${file.originalname}`, {encoding: 'base64'})
        uploadParams.Body = rStream
        uploadParams.Key = path.basename(`medium_${file.originalname}`);
        await s3.upload (uploadParams, function (err, data) {
            if (err) {
              console.log("Error", err);
            } if (data) {
              console.log("Upload Success", data.Location);
            }
          });
    })
    const writable = fs.createWriteStream('newnew.png', {encoding: 'base64'})
    uploadParams.Body = readable
    readable.pipe(writable)
    uploadParams.Key = path.basename(file.originalname);
    await s3.upload (uploadParams, function (err, data) {
        if (err) {
          console.log("Error", err);
        } if (data) {
          console.log("Upload Success", data.Location);
        }
      });
    const newPhoto = new Photo({
        name: file.originalname,
        description: req.body.description || '',
        small: `https://photos-gallery.s3.eu-central-1.amazonaws.com/small_${req.file.originalname}`,
        medium: `https://photos-gallery.s3.eu-central-1.amazonaws.com/medium_${req.file.originalname}`,
        large: `https://photos-gallery.s3.eu-central-1.amazonaws.com/${req.file.originalname}`,
        isFeatured: req.body.isFeatured || false
    })
    const savedPhoto = await newPhoto.save()
    
    res.json({msg: 'Created'})
})

module.exports = photosRouter
