const {User} = require('../models2/index1');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const createError = require('../utils/createError');
require('dotenv').config();

module.exports.loginUser = async (req, res, next) => {
    try {
        const {email, password} = req.body;
        const user = await User.findOne({where: {
            email: email
        }});

        if (!user) {
            createError("incorrect email or password", 400)
        };
        
        const compareResult = await bcrypt.compare(password, user.password);
        if (!compareResult) return res.status(400).json({message: "Incorrect username or password"})
        
        const token = jwt.sign({userId: user.id, email: user.email, role: user.role}, process.env.TOKEN_SECRET, 
            {expiresIn: "30d"});

        res.send({username: user.username, userId:user.id, email: user.email, token, role: user.role });
    } catch(err) {next(err)}
}

module.exports.getUser = async (req, res, next) => {
    try {
        //Validator middleware needs to attach req.user to the request first
        const {userId: id, email, username, role} = req.user;
        res.json({id, email, username, role})
    } catch (error) {
        next(error)
    }
}