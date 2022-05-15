const jwt = require('jsonwebtoken');
const { User } = require('../models');
const createError = require('../utils/createError');

require('dotenv').config();

module.exports = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);

    if (!decoded) {
        createError("Invalid token", 401)
    };

    const {userId,role} = decoded;
    const user = await User.findByPk(userId);
    if (!user || (role !== "teacher")) {
        createError("Unauthorized", 403);
    }

    next();
}