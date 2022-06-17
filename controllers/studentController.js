const {
  Student,
  Course,
  sequelize,
  StudentCourse,
  Lesson,
  VideoLesson,
  Teacher,
  StudentLesson,
} = require("../models");
const { v4: uuidv4 } = require("uuid");
const createError = require("../utils/createError");
const ejs = require("ejs");
const pdf = require("html-pdf");
const util = require("util");
const { destroy, cloudinary, upload } = require("../utils/cloudinary");
const { clearCertificateDir, clearMediaLocal } = require("../services/clearFolder");
const omise = require("../utils/omise");
const { USDtoTHB } = require("../services/currencyConverter");
const downloadFromUrl = require('../services/fileDownload')
const validator = require('validator');
const bcrypt = require('bcryptjs');

const renderFile = util.promisify(ejs.renderFile);

const createPdf = (data, options) =>
  new Promise((resolve, reject) => {
    pdf
      .create(data, options)
      .toFile(`certificates/${new Date()}.pdf`, (err, success) => {
        if (err) return reject(err);
        resolve(success);
      });
  });



exports.buyCourses = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const studentId = req.user.id;
    const { courseItems } = req.body;
    const id = uuidv4();
    // const course = await Course.findOne({where : {
    //     id: courseId
    // }, transaction: t});

    const courseArray = courseItems.map((el) => ({
      id: uuidv4(),
      studentId,
      courseId: el.id,
      price: el.price,
      chargeId: req.chargeId,
      teacherEarningTHB: req.transferAmount[el.id]
    }));



    const studentCourses = await StudentCourse.bulkCreate(courseArray, {
      transaction: t,
    });
    console.log(studentCourses);
    await t.commit();

    res.status(201).json({
      studentCourses,
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

//chrg_test_5s653z9maihdgh5qwky

exports.markLessonComplete = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const lessonId = req.params.lessonId;
    
    const lesson = await Lesson.findOne({
      where: {
        id: lessonId,
      },
    });

    // if (!lesson) createError('lesson not found', 400);

    const chapter = await lesson.getChapter();
    if (!chapter) createError("chapter does not match", 400);
    const course = await chapter.getCourse();
    if (!course) createError("course does not match", 400);

    if (lesson.lessonType !== "video") {
      createError("Non-video lessons cannot be marked complete manually");
    }

    const existStudentLesson = await StudentLesson.findOne({
      where: {
        studentId,
        lessonId,
      },
    });

    if (!existStudentLesson) {
      const studentLesson = await StudentLesson.create({
        studentId,
        lessonId,
        status: "COMPLETED",
        courseId: course.id,
        id: uuidv4(),
      });
    } else {
      //studentLesson already exists, update the entry instead
      await StudentLesson.update(
        {
          status: "COMPLETED",
        },
        { where: { studentId, lessonId } }
      );
    }

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};

exports.markLessonIncomplete = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const lessonId = req.params.lessonId;
    
    const studentLesson = await StudentLesson.findOne({
      where: {
        studentId,
        lessonId,
      },
    });

    await studentLesson.destroy();

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};

exports.validateComplete = async (req, res, next) => {
  try {
    const courseId = req.params.courseId;
    const studentId = req.user.id;
    console.log(courseId);
    //count all of the lessons that the student has completed
    const { count: lessonsCompleted } = await StudentLesson.findAndCountAll({
      where: {
        studentId,
        courseId,
        status: "COMPLETED",
      },
    });
    const { count: lessonCount } = await Lesson.findAndCountAll({
      where: {
        courseId,
      },
    });

    //If the status is "completed", then don't upload a new file to cloudinary.
    // Use the existing link(out dated but "previously completed").
    //Teacher adding lessons will change the status to previously completed, in which case the student has to re-verify the certificate.
    //Which will change the status back to completed if all the lessons are done.
    const studentCourse = await StudentCourse.findOne({
      where: {
        studentId,
        courseId
      }
    })

    if (studentCourse.status === "PREVIOUSLY_COMPLETED" && (lessonsCompleted < lessonCount)) {
      return res.json({status: "PREVIOUSLY_COMPLETED"});
    } else if (studentCourse.status === "COMPLETED") {
      return res.json({status: "ALREADY_COMPLETED"})
    }

    
    if (lessonCount === 0) createError("no lessons found");
    if (lessonsCompleted < lessonCount) {
      return res.json({
        status: "NOT_COMPLETED"
      })
    };
    //student info is already in req.user
    next();
  } catch (err) {
    next(err);
  }
};

exports.getCertficate = async (req, res, next) => {
  try {
    const { firstName, lastName } = req.user;
    let today = new Date();
    const dateOptions = {
      day: "numeric",
      month: "long",
      year: "numeric",
    };
    //June 6, 2022
    const date = today.toLocaleDateString("jp-JP", dateOptions);
    //2022/6/6

    //Format date to ISO standard.
    const data = await renderFile("views/cert-template.ejs", {
      firstName,
      lastName,
      date: date,
    });
    const options = {
      height: "11.25in",
      width: "8.5in",
      header: {
        height: "20mm",
      },
      footer: {
        height: "20mm",
      },
    };
    const response = await createPdf(data, options);
    // response : {filename: "/Users/admin/projects/fullstack_proj/backend/cert.pdf"}
    if (!response) createError("pdf creation error", 500);
    req.pdf = { filename: response.filename };
    req.date = today;
    next();
  } catch (err) {
    next(err);
  }
};

exports.sendCertificateStatus = async (req, res, next) => {
  try {
    const courseId = req.params.courseId;
    const studentId = req.user.id;
    const studentCourse = await StudentCourse.findOne({
      where: {
        studentId,
        courseId,
      },
    });

    const { certificatePublicId } = studentCourse;
    if (certificatePublicId) {
      const result = await destroy(certificatePublicId);
      console.log(result);
    }
    if (!req.certificateData.public_id) createError("public id not found");
    studentCourse.certificatePublicId = req.certificateData.public_id;
    studentCourse.certificateUrl = req.certificateData.secure_url;
    if (!req.date) createError("NO date has been passed down", 500);
    studentCourse.latestCompletedDate = req.date;
    console.log(req.date);
    studentCourse.status="COMPLETED";
    await studentCourse.save();
    res.json({
      status: "JUST_COMPLETED"
    });
  } catch (error) {
    next(error);
  } finally {
    clearCertificateDir();
  }
};

exports.checkPayment = async (req, res, next) => {
  try {
    const { omiseToken: token, courseItems } = req.body;
    const user = req.user;
    console.log(courseItems);
    const sum = courseItems.reduce((sum, cur) => sum + cur.price, 0); // in dollars

    const customer = await omise.customers.create({
      email: user.email,
      description: user.firstName + user.lastName,
      card: token,
    });
    console.log(customer);

    const charge = await omise.charges.create({
      amount: sum * 100,
      currency: "usd",
      customer: customer.id,
    });
    
    const transferAmountObj = {};
    for (let courseItem of courseItems) {
      const { id: courseId, price } = courseItem;
      const course = await Course.findByPk(courseId);
      const teacher = await course.getTeacher();
      const bankAccountNumber = teacher.bankAccountNumber;
     
      const recipient = await omise.recipients.create({
        name: teacher.firstName + " " + teacher.lastName,
        email: teacher.email,
        type: "individual",
        bank_account: {
          number: bankAccountNumber,
          name: teacher.bankAccountName,
          bank_code: teacher.bankCode,
        },
      });
      //amount must be in cents
      //I take half of the teachers' income
      console.log("price = ------", price);
      try {
        amount = await USDtoTHB(Number(price));
      } catch (err) {
        console.log(err);
        amount = Number(price) * 35;
      }
      //baht to satang

      const transfer = await omise.transfers.create({
        amount: Number(amount) * 0.5 * 100,
        recipient: recipient.id,
      });
      //transfer ; {amount: 20000}
      transferAmountObj[courseItem.id] = transfer.amount/100 || 0;
      console.log("recipient: ------", recipient);
      console.log("transfer:-------", transfer);
      console.log("charge------->", charge);

    }
    req.chargeId = charge.id;
    req.transferAmount = transferAmountObj;
    next();
  } catch (err) {
    next(err);
  }
};


exports.downloadCertificate = async (req, res, next) => {
  try {
    const courseId = req.params.courseId;
    const studentId = req.user.id;

    const studentCourse = await StudentCourse.findOne({where: {
      studentId,
      courseId
    }});

    if (!studentCourse.certificateUrl) createError("Student must complete all the lessons before requesting the certificate", 403);
    if (!studentCourse) createError("student and course do not match", 400);

    const certificateUrl = studentCourse.certificateUrl;

    const tempFilename = uuidv4()+".pdf";
    await downloadFromUrl(certificateUrl, './media', tempFilename);

    res.download("./media/"+tempFilename);
    
  } catch (error) {
    next(error)
  } finally {
    clearMediaLocal();
  }

}

exports.fetchTransactionsAsStudent = async (req, res, next) => {
  try {
    const student = await Student.findOne({where: {
      id: req.user.id,
    },
      include: {
        model: Course,
        attributes: ["id", "name"],
        through: {
          attributes: ["chargeId", "price", "createdAt"]
        }
      },
      attributes: ["firstName", "lastName", "id"],
    })

  res.json({
    student
  })

  } catch (err) {
    next(err)
  }
}