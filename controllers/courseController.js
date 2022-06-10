const bcrypt = require('bcryptjs');
const {v4 : uuidv4} = require('uuid');
const jwt = require('jsonwebtoken');
const { Course, Teacher, User, Chapter, sequelize, Lesson, VideoLesson, StudentLesson } = require("../models")
const {Op} = require('sequelize');
const createError = require('../utils/createError');
const { destroy } = require('../utils/cloudinary');
const { clearMediaLocal } = require('../services/clearFolder');
const { getOwnedCourses } = require('../services/courseServices');
const omise = require('../utils/omise');



exports.validateCourseParams = async (req, res, next) => {
    
    try {
        const validLevels = ["all", "beginner", "intermediate", "advanced"]
        if (req.body.name.length > 0) createError("Course name can't be empty");
        if (!validLevels.includes(req.body.level)) createError("Invalid course level");
        //If there's any white space before or after coursename, trim them.
        req.body.name = req.body.name?.trim();
        next();
    } catch (error) {
        next(error);
    }
}

exports.createCourse = async (req, res, next) => {
// PAYLOAD required
// HEADERS: {authorization: BEARER __TOKEN} : TOKEN WITH USER_ID, ROLE, USERNAME AND EMAIL
// MUST BE AUTHENTICATED TO BE ABLE TO ACCESS REQ.USER
try {
    const {name,description,level} = req.body;

    const {id: userId} = req.user;

    const imageUrl = req.imageData.secure_url;
    const videoUrl = req.videoData.secure_url;

    const result = await Course.create({name, description, teacherId: userId, id: uuidv4(), level, imageLink: imageUrl, videoLink: videoUrl,
    imagePublicId: req.imageData.public_id, videoPublicId: req.imageData.public_id});
    
    console.log("------------")
    console.log(result);

    res.send(result);
} catch(err) {
 next(err)
}
};

exports.getCourseInfo = async (req, res, next) => {
    try {
        const courseId = req.params.id;
       
        const course = await Course.findOne({where: {id: courseId}});
        
        const chapters = await Chapter.findAll({where: {courseId},
                    include: {
                        model: Lesson,
                        include: {
                            model: VideoLesson
                        }
                    }, 
                    order: [["chapterIndex", "ASC"],[Lesson, "lessonIndex", "ASC"]]
                   });
        const teacher = await Teacher.findOne({where: {
            id: course.teacherId
        }, attributes: ["firstName", "lastName"]});
        
        const objCourse = JSON.parse(JSON.stringify(course));
            
        let totalLength = await VideoLesson.findAll({
            attributes: [
                "courseId",
               [sequelize.fn('SUM', sequelize.col('duration')), 'duration']
            ],
            where: {
                courseId
            },
            group: "courseId"
        });
        console.log(totalLength)
        if (totalLength.length !== 0) {totalLength = JSON.parse(JSON.stringify(totalLength))
        objCourse.totalLength = totalLength[0].duration}


        res.json({course: {
            ...objCourse,
            chapters,
            teacher
        }});
    } catch (error) {
        next(error)
    }
}

exports.updateCourse = async (req, res, next) => {
    try {

        const {name,description,level,price} = req.body;

        const {id: userId} = req.user;
        const {courseId} = req.params;
    
        const imageUrl = req.imageData?.secure_url;
        const videoUrl = req.videoData?.secure_url;

        const course = await Course.findOne({where: {id: courseId} });
    
        if (!course) createError("course not found");
        if (course.teacherId !== userId) createError("you are not authorized to edit", 403);
      
       // If we want to replace the existing image url
        if (course.imageLink && req.imageData?.secure_url) {
            const result = await destroy(course.imagePublicId)
            course.imagePublicId = req.imageData?.public_id ;
            course.imageLink = imageUrl;
        }
        //otherwise the imageLink stays the same
        console.log(course.videoLink, req.videoData?.secure_url);
        if (course.videoLink && req.videoData?.secure_url) {
            const result = await destroy(course.videoPublicId, {resource_type: "video"});
            course.videoPublicId = req.videoData?.public_id ;
            course.videoLink = videoUrl;
            console.log(course.videoLink);
        }

        course.name = name;
        course.description = description;
        course.level = level
        course.updatedAt = new Date();
        if (price) course.price = price;
        
        await course.changed('updatedAt', true);
        await course.save();
    
        clearMediaLocal();
    
        res.send({result: "success"});
    } catch (error) {
        next(error)
    }
}

exports.publicizeCourse = async (req, res, next) => { 
    try {
        const courseId = req.params.courseId;
        const course = await Course.findByPk(courseId);
        course.isPublished = true;
        await course.changed('updatedAt', true);
        await course.save();
        res.sendStatus(204);
    } catch (error) {
        next(error)
    }
 }

 //getAllCourse("own") or getAllCourse("notOwn")
 exports.getAllNotOwnedCourses = async (req, res, next) => {
     try {
         // get all registered course ids
         
         const studentId = req.user.id;
         const ownIds = await getOwnedCourses(studentId);
         let courses = await Course.findAll({
             include: {
                 model: Teacher,
                 attributes: ["firstName", "lastName"]
             },
             where : {
                 id : {
                     [Op.notIn] : ownIds
                 },
                 isPublished: true
             }
         });
         //get all the index to find the video lengths in the video lesson table
         const courseIds = courses.map(course => course.id);

         let totalLength = await VideoLesson.findAll({
             attributes: [
                 "courseId",
                [sequelize.fn('SUM', sequelize.col('duration')), 'duration']
             ],
             where: {
                 courseId: {
                     [Op.in] : courseIds
                 }
             },
             group: "courseId"
         });

         totalLength = JSON.parse(JSON.stringify(totalLength))
         //An array is returned. To make it easily accessble, transform it to an object.
         const totalLengthObj = totalLength.reduce( (acc, cur) => {
             acc[cur.courseId] = cur.duration;
             return acc
         },{});
         
         courses = JSON.parse(JSON.stringify(courses));
         //set total length key for all the fetched courses
         courses.forEach(course => {
             course.totalLength = totalLengthObj[course.id] || 0;
         })

         res.json({courses});
     } catch (err) {
         next(err);
     }
 }

 module.exports.getStudentOwnedCourses = async (req, res, next) => {
     try {
        const studentId = req.user.id;

        const ownIds = await getOwnedCourses(studentId);


        const ownCourses = await Course.findAll({
            where: {
                id: {
                    [Op.in] : ownIds
                }
            },
            include: {
                model: Teacher,
                attributs: ["firstName", "lastName"]
            }
        });

        console.log()
        let numberCompleted = await StudentLesson.findAll({
            where: {
                courseId: {
                    [Op.in] : ownIds
                },
                studentId
            },
            attributes: [
                "courseId",
                [sequelize.fn('COUNT', sequelize.col('id')), "completedLessons"]
            ],
            group: "courseId"
        });
        numberCompleted = JSON.parse(JSON.stringify(numberCompleted))
        //[{courseId: "courseId1", completedLessons: 3}, {courseId: "courseId2", completedLessons: 2}]
        console.log("number completed", numberCompleted)
        let numberLesson = await Lesson.findAll({
            where: {
                courseId: {
                    [Op.in] : ownIds
                }
            },
            attributes: [
                "courseId",
                [sequelize.fn('COUNT', sequelize.col('id')), 'totalLessons']
            ],
            group: "courseId"
        })
        numberLesson = JSON.parse(JSON.stringify(numberLesson))
        //[{courseId: "courseId1", totalLessons: 5}, {courseId: "courseId2", totalLessons: 5}]

        

        //Find total video length
        let totalLength = await VideoLesson.findAll({
            attributes: [
                "courseId",
               [sequelize.fn('SUM', sequelize.col('duration')), 'duration']
            ],
            where: {
                courseId: {
                    [Op.in] : ownIds
                }
            },
            group: "courseId"
        });
        totalLength = JSON.parse(JSON.stringify(totalLength))

        
        const numberCompletedObj = numberCompleted.reduce((acc, cur) => {
            acc[cur.courseId] = cur.completedLessons; return acc;
        }, {})
        const numberLessonObj = numberLesson.reduce((acc, cur) => {
            acc[cur.courseId] = cur.totalLessons; return acc;
        }, {})
        
        const totalLengthObj = totalLength.reduce( (acc, cur) => {
            acc[cur.courseId] = cur.duration; return acc;
        },{});

        const courses = JSON.parse(JSON.stringify(ownCourses));

        courses.forEach(course => {
            course.numberCompleted = numberCompletedObj[course.id] || 0;
            course.numberLesson = numberLessonObj[course.id];
            course.totalLength = totalLengthObj[course.id];
        });

        res.json({courses});

     } catch (err) {
        next(err)         
     }
 }

 module.exports.getStudentOwnedCourseById = async (req, res, next) => {
    try {
       const studentId = req.user.id;

       const courseId = req.params.courseId;

       let course = await Course.findOne({
           where: {
               id: courseId
           },
           include: {
               model: Teacher,
               attributs: ["firstName", "lastName"]
           }
       });

       const numberCompleted = await StudentLesson.count({
           where: {
               courseId,
               studentId
           }
       });

       
       const numberLesson = await Lesson.count({
           where: {
               courseId
           }
       })
    

       const totalLength = await VideoLesson.sum('duration',{
           where: {
               courseId
           }
       });
   
       course = JSON.parse(JSON.stringify(course));
       course.numberCompleted = numberCompleted;
       course.numberLesson = numberLesson;
       course.totalLength = totalLength;

       res.json({course});

    } catch (err) {
       next(err)         
    }
}





 
