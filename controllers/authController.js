const { Teacher, Student } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const createError = require("../utils/createError");
require("dotenv").config();
const { v4: uuidv4 } = require("uuid");
const validator = require("validator");
const { upload } = require("../utils/cloudinary");
const { clearMediaLocal } = require("../services/clearFolder");


//Route default to both teacher and students
module.exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    let role;
    let user = await Teacher.findOne({
      where: {
        email: email,
      },
    });
    role = "teacher";

    if (!user) {
      user = await Student.findOne({ where: { email } });
      role = "student";
    }

    if (!user) {
      role = "";
      createError("incorrect email or password", 400);
    }

    const compareResult = await bcrypt.compare(password, user.password);
    if (!compareResult)
      return res
        .status(400)
        .json({ message: "Incorrect username or password" });
    console.log;
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: role },
      process.env.TOKEN_SECRET,
      { expiresIn: "30d" }
    );

    res.send({
      username: user.username,
      userId: user.id,
      email: user.email,
      token,
      role: role,
      imageUrl: user.imageUrl,
      firstName: user.firstName,
      lastName: user.lastName
    });
  } catch (err) {
    next(err);
  }
};

module.exports.getUser = async (req, res, next) => {
  try {
    //Validator middleware needs to attach req.user to the request first
    const { userId: id, email, username, role, firstName, lastName, imageUrl } = req.user;
    console.log(req.user);
    res.json({ id, email, username, role, firstName, lastName, imageUrl });
  } catch (error) {
    next(error);
  }
};

exports.registerTeacher = async (req, res, next) => {
  try {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const {
      username,
      email,
      password,
      firstName,
      lastName,
      bankAccountNumber,
      bankAccountName,
      bankCode,
    } = req.body;

    if (!username) createError("Username is required", 400);
    if (!email) createError("Email is required", 400);
    if (!password) createError("Password is required", 400);
    if (!firstName) createError("First name is required", 400);
    if (!lastName) createError("Last name is required", 400);
    if (!bankAccountName) createError("Name on credit card is required", 400);
    if (!bankAccountNumber) createError("Credit card number is required", 400);
    if (!bankCode) createError("Bank code is required", 400);

    const newId = uuidv4();
    //Must make sure that this email isn't already registered as student
    const existStudent = await Student.findOne({ where: { email } });
    
    if (existStudent) createError("You have already registered", 403);
    const hashedPassword = await bcrypt.hash(password, salt);
    // const newUser = await User.create({username, email, password: hashedPassword, id: newId, role: 'teacher'});
    const newTeacher = await Teacher.create({
      id: newId,
      username,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      bankAccountNumber,
      bankAccountName,
      bankCode,
    });

    const token = jwt.sign(
      { email, userId: newId, role: "teacher" },
      process.env.TOKEN_SECRET
    );

    const responseObj = {
      userId: newTeacher.id,
      email: newTeacher.email,
      token,
      role: "teacher",
    };
    res.send(responseObj);
  } catch (err) {
    next(err);
  }
};

exports.registerStudent = async (req, res, next) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;

    if (!username) createError("Username is required", 400);
    if (!email) createError("Email is required", 400);
    if (!password) createError("Password is required", 400);
    if (!firstName) createError("First name is required", 400);
    if (!lastName) createError("Last name is required", 400);

    const id = uuidv4();
    const existTeacher = await Teacher.findOne({ where: { email } });
    if (existTeacher)
      createError("You have already registered as a teacher", 403);
    const hashedPassword = await bcrypt.hash(password, 10);
    const student = await Student.create({
      id,
      username,
      email,
      password: hashedPassword,
      firstName,
      lastName,
    });
    const token = jwt.sign(
      { email, userId: id, role: "student" },
      process.env.TOKEN_SECRET
    );

    res.json({ userId: id, email, token, role: "student" });
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const {username, oldpassword, newpassword, firstName, lastName} = req.body;
    
    let newHashedPw
    if (oldpassword) {
      if (!newpassword) createError("new password is required", 400);
      const isCorrect = await bcrypt.compare(oldpassword, req.user.password);
      if (!isCorrect) createError("Invalid credentials", 400);

      newHashedPw = await bcrypt.hash(newpassword,10);

    }

    console.log(req.file)
    let imageUrl;
    let imagePublicId;
    if (req.file) {
      const result = await upload(req.file.path);
      console.log(result);

      //delete the existing profile pic
      if (req.user.imageUrl) {
        const response = await destroy(req.user.imagePublicId);
        console.log(response);
      }

      imageUrl = result.secure_url;
      imagePublicId = result.public_id

    }

    
    if (req.user.role === "student") await Student.update({username, password: newHashedPw, firstName, lastName, imageUrl, imagePublicId}, {
      where: {
        email: req.user.email
      }
    });
    if (req.user.role === "teacher") await Teacher.update({username, password: newHashedPw, firstName, lastName, imageUrl, imagePublicId}, {
      email: req.user.email
    });

    res.sendStatus(204);
    
  } catch (err) {
    next(err)
  } finally {
    clearMediaLocal();
  }
}