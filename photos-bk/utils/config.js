require('dotenv').config()

const aws_id = process.env.AWS_KEY_ID
const aws_secret_key = process.env.AWS_KEY_SECRET

module.exports = {aws_id, aws_secret_key}
