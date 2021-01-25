const sharp = require('sharp')
const path = require('path')
const {Readable} = require('stream')
const AWS = require('aws-sdk')
const config = require('../utils/config')

AWS.config.update({accessKeyId: config.aws_id, secretAccessKey: config.aws_secret_key , region: 'eu-central-1'});
let s3 = new AWS.S3({apiVersion: '2006-03-01'});

const upload = async (data, prefix, name) => {
    var uploadParams = {Bucket: 'photos-gallery', Key: '', Body: ''}
    const rStream = new Readable()
    rStream._read = () => {}
    rStream.push(data)
    rStream.push(null)
    uploadParams.Body = rStream
    uploadParams.Key = path.basename(`${prefix}_${name}`);
    await s3.upload (uploadParams, function (err, data) {
        if (err) {
          console.log("Error", err);
        } if (data) {
          console.log("Upload Success", data.Location);
        }
      });
}

const removePhoto = async (photo) => {
    const params = {
        Bucket: 'photos-gallery',
        Delete: {
          Objects: [
            {
              Key: photo.small.substring(photo.small.lastIndexOf('/')+1)
            },
            {
              Key: photo.medium.substring(photo.medium.lastIndexOf('/')+1)
            },
            {
              Key: photo.large.substring(photo.large.lastIndexOf('/')+1)
            }
          ],
          Quiet: false
        }
      }
      await s3.deleteObjects(params, function(err, data){
        if (err) console.log(err, err.stack); // an error occurred
        else     console.log(data);           // successful response
      }) 
}

const resizeOne = async (buffer, prefix, name, size) => {
    if (size.length === 2){
        const [height, width] = size
        sharp(buffer)
        .resize(height, width)
        .toBuffer()
        .then(async data => {
            upload(data, prefix, name)
        })
    }else {
        upload(buffer, prefix, name)
    }
    
}
const resizeMultiple = async (buffer, sizes, name) =>{
  await sizes.forEach( obj => resizeOne(buffer, obj.prefix, name, obj.size))  
}

module.exports = {resizeOne, resizeMultiple, removePhoto}