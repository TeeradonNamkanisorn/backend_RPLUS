const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const {
  Course,
  Teacher,
  User,
  Chapter,
  sequelize,
  Lesson,
  Student,
} = require("../models");
const { Op } = require("sequelize");
const createError = require("../utils/createError");

require("dotenv").config;

exports.getAllCourses = async (req, res, next) => {
  try {
    const { id } = req.user;
    const teacher = await Teacher.findByPk(id);
    const courses = await Course.findAll({
      where: {
        teacherId: teacher.id,
      },
      include: {
        model: Student,
        attributes: ["id"]
      }
    });

    res.json({ courses });
  } catch (error) {
    next(error);
  }
};
//
