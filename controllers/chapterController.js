const bcrypt = require('bcryptjs');
const {v4 : uuidv4} = require('uuid');
const jwt = require('jsonwebtoken');
const { Course, Teacher, User, Chapter, sequelize, Lesson, VideoLesson, StudentLesson} = require("../models")
const {Op} = require('sequelize');
const createError = require('../utils/createError');
const { destroy } = require('../utils/cloudinary');

exports.appendChapter = async (req, res, next) => {
    // PAYLOAD required
    // HEADERS: {authorization: BEARER __TOKEN}
    // BODY: {name, description, courseId}
    const t = await sequelize.transaction();
    try {
        
        const {name, description, courseId} = req.body;
        const id = uuidv4();

       const course = await Course.findByPk(courseId);
       if (course.teacherId !== req.user.id) createError("You are unauthorized", 403);
        //Find the index of the highest chapter then add it by one to get the new chapter's index
        const max_index = await Chapter.max('chapterIndex', {where: {courseId}});
        const new_index = max_index? max_index+1 : 1;
        const result = await Chapter.create({name, chapterIndex: new_index, description, id, courseId}, {transaction: t});

        await t.commit();
        await course.changed('updatedAt', true);
        await course.save();
        res.json(result);


    } catch (err) {
        await t.rollback();
        next(err)
    }
};

exports.insertChapterByIndex = async (req, res, next) => {
    //Payloads: {name, index, description, courseId}
    //Headers: {authorization: BEARER TOKEN}
   try {
        const {name, index, description, courseId} = req.body;
        const id = uuidv4();

        const token = req.headers.authorization?.split(' ')[1];

        const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        
        const {userId,role} = decoded;

        if (!decoded) createError("Invalid token", 401);

        const user = await User.findByPk(userId);

        if (!user) createError("User Id not found", 400);
        if (role !== "teacher") createError("Only teachers are authorized to edit the resource", 403);

        //To insert a chapter in-between, increase the index of chapters beyond the current by 1
        //Op.gte = greater or equal
        const result = await Chapter.increment({chapterIndex: 1}, {where: {
            chapterIndex: {
                [Op.gte]: index
            },
            courseId
        }} );

        const newChap = await Chapter.create({name, chapterIndex: index, description, courseId, id});
        

        res.json(newChap);
   } catch (err) {
       next(err)
   }
};

exports.deleteChapter = async (req, res, next) => {
    const t = await sequelize.transaction();
    // Steps: 1. delete all related cloudinary videos 2.delete all studentLessons 3.delete all video lessons 4. delete all lessons
    // 5. Delete the chapter itself
    try {
        const { chapterId } = req.params
        const chapter = await Chapter.findByPk(chapterId);

        if (!chapter) createError("Chapter not found", 400);

        const course = await Course.findByPk(chapter.courseId);

        if (course.teacherId !== req.user.id) createError("You are not authorized to edit this resource", 403);

        //videoLesson's id is the same as lesson.id
        const vidLessons = await Lesson.findAll({
            where: {
                lessonType: "video",
                chapterId
            },
            attributes: ["id"]
        });

        //For now there's only video type but there might be more lesson types in the future
        const allLessons = await Lesson.findAll({where: {
            chapterId,
        }, attributes: ["id"]
    });
        const allLessonIds = JSON.parse(JSON.stringify(allLessons)).map(e => e.id);

        const vidLessonIds = vidLessons.map(e => e.id);

        let videoLessons = await VideoLesson.findAll({
            where: {
                id: {
                    [Op.in] : vidLessonIds
                }
            },
            attributes: ["videoPublicId", "id"]
        });
        // not a plain object

        videoLessons = JSON.parse(JSON.stringify(videoLessons));
        console.log('video lessons', videoLessons)
        const videoLessonIds = videoLessons.map(e => e.id);
        const publicIds = videoLessons.map(e => e.videoPublicId);
        
        console.log(publicIds)
        const promiseArray = [];
        //Step 1
        for (let publicId of publicIds) {
            promiseArray.push(destroy(publicId, {resource_type: "video"}))
        }

        const result = await Promise.all(promiseArray);
        console.log(result);

        // everything has been deleted now it's safe to delete all the records
        //step 2
        await StudentLesson.destroy({where: {
            lessonId: {
                [Op.in]: allLessonIds
            }, 
        },
            transaction: t 
    })
        //delete video by ids
        await VideoLesson.destroy({where: {
            id: {
                [Op.in] : videoLessonIds
            }
        },
        transaction: t        
    });

        await Lesson.destroy({where: {
            id: {
                [Op.in] : allLessonIds
            }
        }, transaction : t
    })

        const currentIndex = chapter.chapterIndex;
        await Chapter.destroy({where: {
            id: chapterId
        },
        transaction: t
    })

        await Chapter.increment({chapterIndex: -1}, {where: {
            chapterIndex: {
                [Op.gte]: currentIndex
            },
            courseId: course.id
        }, transaction: t} );

        await t.commit();
        res.sendStatus(204);
    } catch (err) {
        await t.rollback();
        next(err)
    }
}

exports.swapChapters = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const {inputChapters} = req.body;
        // [{index: 1, id: "abc"}, {index: 2, id: "def"}]
        const {index: index1, id: id1} = inputChapters[0]
        const {index: index2, id: id2} = inputChapters[1]

        const chapter1 = await Chapter.findByPk(id1);
        const chapter2 = await Chapter.findByPk(id2);

        if (chapter1.courseId !== chapter2.courseId) createError("chapters must be on the same course", 400);
        const courseId = chapter1.courseId;

        //get the new index for the first chapter
        await Chapter.update({chapterIndex: index2}, {
            where: {id: id1},
            transaction : t
        })
        //swap for the second as well
        await Chapter.update({chapterIndex: index1}, {
            where: {id: id2}, 
            transaction: t
        })


        await t.commit();

        res.sendStatus(204);

    } catch (err) {
        await t.rollback();
        next(err)
    }
}