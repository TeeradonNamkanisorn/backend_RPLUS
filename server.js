const express = require('express');
// const sequelize = require('./utils/database');
const chapterRouter = require('./routes/chapterRouter');
const lessonRouter = require('./routes/lessonRouter');
const courseRouter = require('./routes/courseRouter');
const teacherRouter = require('./routes/teacherRouter');

const cors = require('cors');
const userRouter = require('./routes/userRouter');
const invalidAddressMW = require('./middlewares/invalidAddressMW');
const errorHandlerMW = require('./middlewares/errorHandlerMW');
const {sequelize} = require('./models/index1');
const { clearMediaLocal } = require('./services/clearFolder');

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
app.use('/user', userRouter);
  
//call clear media local every time after cloudinary upload to free up media storage

app.use(invalidAddressMW);
app.use(errorHandlerMW);

app.use((err, req, res, next) => {
  console.log(err);
  res.status(400).send(err);
});



sequelize.sync({}).then(
    app.listen(4000, () => {
        console.log("server running on http://localhost:4000")
    })
).catch(err => console.log(err));