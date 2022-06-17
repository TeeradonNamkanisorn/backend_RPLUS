const jwt = require('jsonwebtoken');
const {Teacher, Student} = require('../models');
const createError = require('../utils/createError');

const jwtAuthenticator= (userRole = "all") => async (req, res, next) => {
    //userRole can only be all (no need to specify) or teacher or student
    //token in the header is required
    try {
        if (Boolean(!(req.headers.authorization))) createError("token is required", 401);
        const [prefix, token] = req.headers.authorization?.split(' ');
        if (prefix.toLowerCase() !== "bearer") createError("invalid authorization headers", 401);
        // Bearer "null" from the request. Null is from not finding the token in localstorage.getItem 
        if (token === "null") createError("token is required, you are unauthorized", 401);
        // Normal case
        if (!token) createError("token is required, you are unauthorized", 401)
        
        const decoded = jwt.verify( token, process.env.TOKEN_SECRET);
        
        const {userId, email, role} = decoded;
        // console.log(decoded)
        // console.log(role)
        let user;
        if ( role === "teacher") {
             user = await Teacher.findOne({where: {id: userId, email}});
        } else if ( role === "student") {
            user = await Student.findOne({where: {id: userId, email}});
        } else {
            createError("invalid user role", 401);
        }
        // create an error if userRole do not match
        console.log(role, userRole);
        if ((userRole !== "all") && (userRole !== role)) createError("Invalid user role", 403); 
        //any functions that come after can use req.user to get user data
        const newUser = JSON.parse(JSON.stringify(user));
        newUser.role = role;
        req.user = newUser;
    } catch(err) {
        next(err)
    }
    next();
}

module.exports = jwtAuthenticator