const express = require('express');
const VideoLesson = require('./models/videoLesson');
const { chapterRouter } = require('./routes/chapterRouter');
const { lessonRouter } = require('./routes/lessonRouter');
const courseRouter = require('./routes/courseRouter');
const Sequelize = require('sequelize');
const sequelize = require('./utils/database');
let Chapter = require('./models/chapter');
let Lesson = require('./models/lesson');
const Course = require('./models/course');
const DocumentLesson = require('./models/document');
const User = require('./models/user');
const teacherRouter = require('./routes/teacherRouter');
const Teacher = require('./models/teacher');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors());
app.use(
    express.urlencoded({
      extended: true
    })
  );

  app.use('/chapter', chapterRouter);
  app.use('/lesson', lessonRouter);
  app.use('/course', courseRouter);
  app.use('/teacher', teacherRouter);
    

Chapter.hasMany(Lesson);
Lesson.belongsTo(Chapter);

VideoLesson.belongsTo(Lesson);
Lesson.hasOne(VideoLesson);

Lesson.hasOne(DocumentLesson);
DocumentLesson.belongsTo(Lesson);


Chapter.belongsTo(Course);
Course.hasMany(Chapter);

Course.belongsTo(Teacher);
Teacher.hasMany(Course);


app.use((err,req,res,next) => {
  res.status(400).send({message: err.message});
})
sequelize.sync().then(
    app.listen(4000, () => {
        console.log("server running on http://localhost:4000")
    })
).catch(err => console.log(err));
app.use((err, req, res, next) => {
  res.status(400).send(err);
})
