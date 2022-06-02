const jwt = require('jsonwebtoken');
const {User} = require('../models');
const createError = require('../utils/createError');

const jwtAuthenticator= (userRole = "all") => async (req, res, next) => {
    //userRole can only be all (no need to specify) or teacher or student
    //token in the header is required
    try {
        if (!req.headers.authorization) createError("token is required");
        const [prefix, token] = req.headers.authorization?.split(' ');
        if (prefix.toLowerCase() !== "bearer") createError("invalid authorization headers", 401);
        if (!token) createError("token is required, you are unauthorized", 401);
        const decoded = jwt.verify( token, process.env.TOKEN_SECRET);
        const {userId, email, role} = decoded;
        const user = await User.findOne({where: {id: userId, email}});
        // create an error if userRole do not match
        if ((userRole !== "all") && (userRole !== role)) createError("Invalid user role", 403); 
        //any functions that come after can use req.body to get user data
        req.user = user;
    } catch(err) {
        next(err)
    }
    next();
}

module.exports = jwtAuthenticator