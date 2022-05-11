const bcrypt = require('bcrypt');
const Teacher = require('../models/teacher');
const {v4 : uuidv4} = require('uuid');
const jwt = require('jsonwebtoken');

exports.registerTeacher = async (req, res, next) => {
    try {
        const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const {username, email, password} = req.body;
    const hashedPassword = await bcrypt.hash(password,salt);
    const newUser = await Teacher.create({username, email, password: hashedPassword, id: uuidv4()});
    const token = jwt.sign({username: username, password:password}, "secret");
    const responseObj = {username: newUser.username, id: newUser.id, email: newUser.email, token};
    console.log(responseObj);
    res.send(responseObj);
    } catch (err) {
        next(err)
    }
}

