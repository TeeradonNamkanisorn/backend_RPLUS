const express = require('express');

const chapterRouter = require('./routes/chapterRouter');
const lessonRouter = require('./routes/lessonRouter');
const courseRouter = require('./routes/courseRouter');
const teacherRouter = require('./routes/teacherRouter');
const authRouter = require('./routes/authRouter');
const studentRouter  = require('./routes/studentRouter');

const cors = require('cors');
const invalidAddressMW = require('./middlewares/invalidAddressMW');
const errorHandlerMW = require('./middlewares/errorHandlerMW');

const {sequelize} = require('./models');
const { clearMediaLocal } = require('./services/clearFolder');
const jwtAuthenticator = require('./middlewares/jwtAuthenticator');

const app = express();

app.use(express.json());
app.use(cors());
app.use(
    express.urlencoded({
      extended: true
    })
  );


app.use('/chapter',chapterRouter);
app.use('/lesson', lessonRouter);
app.use('/course', courseRouter);
app.use('/teacher', teacherRouter);
app.use('/auth', authRouter);
app.use('/student', jwtAuthenticator("student"), studentRouter);
  
//call clear media local every time after cloudinary upload to free up media storage

app.use(invalidAddressMW);
app.use(errorHandlerMW);

app.use((err, req, res, next) => {
  console.log(err);
  res.status(400).send(err);
});




sequelize.sync({alter: true})
app.listen(4000, () => {
  console.log("server running on http://localhost:4000")
})