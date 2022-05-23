module.exports = (err, req, res, next) => {
    console.log(err)
    console.log(err.message)
    res.status(err.statusCode || 500).json({message: err.message});
}