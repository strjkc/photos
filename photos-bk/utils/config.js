require('dotenv').config()

const dbUrl = process.env.DBURL
const aws_id = process.env.AWS_KEY_ID
const aws_secret_key = process.env.AWS_KEY_SECRET
const jwtSecret = process.env.SECRET

module.exports = {aws_id, aws_secret_key, dbUrl, jwtSecret}
