const {User} = require('../models/index1');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports.loginUser = async (req, res, next) => {
    try {
        const {email, password} = req.body;

        const user = await User.findOne({where: {
            email: email
        }});

        if (!user) {
            return res.status(400).json({message: "Incorrect username or password"})
        };

        const compareResult = await bcrypt.compare(password, user.password);
        if (!compareResult) return res.status(400).json({message: "Incorrect username or password"})
        
        const token = jwt.sign({username: user.username, userId: user.id, email: user.email, role: user.role}, process.env.TOKEN_SECRET);

        res.send({username: user.username, userId:user.id, email: user.email, token, role: user.role });
    } catch(err) {next(err)}
}