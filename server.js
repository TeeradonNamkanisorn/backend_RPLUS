const express = require('express');
const {sequelize} = require('./models');
const { chapterRouter } = require('./routes/chapterRouter');
const { lessonRouter } = require('./routes/lessonRouter');
const courseRouter = require('./routes/courseRouter');
const teacherRouter = require('./routes/teacherRouter');

const cors = require('cors');
const userRouter = require('./routes/userRouter');
const invalidAddressMW = require('./middlewares/invalidAddressMW');
const errorHandlerMW = require('./middlewares/errorHandlerMW');

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
app.use('/user', userRouter);
  


app.use(invalidAddressMW);
app.use(errorHandlerMW);

sequelize.sync().then(
    app.listen(4000, () => {
        console.log("server running on http://localhost:4000")
    })
).catch(err => console.log(err));
app.use((err, req, res, next) => {
  console.log(err);
  res.status(400).send(err);
})
