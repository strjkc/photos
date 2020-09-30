const { response } = require("express")

const errorHandler = (error, req, resp, next) => {
    if (error.name === 'ValidationError' )
        return resp.status(400).json({error: error.message})   
    next()
}

module.exports = {errorHandler}