module.exports = (sequelize, DataTypes) => {
    const Lesson = sequelize.define('lesson', {
        title: {
            type: DataTypes.STRING,
            allowNull: false
        }, 
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false
        },
        lessonIndex: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        lessonType: {
            type: DataTypes.ENUM("document", "video", "link", "assignment")
        },
        courseId: {
            type: DataTypes.STRING,
            allowNull: false
        }
    });
    Lesson.associate = (models) => {
        Lesson.belongsTo(models.Chapter, {
            onDelete: "RESTRICT",
            onUpdate: "RESTRICT"
        });
        Lesson.hasOne(models.VideoLesson, {
            onDelete: "RESTRICT",
            onUpdate: "RESTRICT"
        });
        Lesson.belongsToMany(models.Student, {
            through: models.StudentLesson,
            onDelete: "RESTRICT",
            onUpdate: "RESTRICT"
        })
    }
    return Lesson
}