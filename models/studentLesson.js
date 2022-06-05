module.exports = (sequelize, DataTypes) => {
    const StudentLesson = sequelize.define('studentLesson', {
        id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        status: {
            type: DataTypes.ENUM("COMPLETED", "PREVIOUSLY_COMPLETED"),
            defaultValue: "COMPLETED"
        },
        courseId: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        indexes: [
            { fields: ['studentId', 'lessonId'], unique: true }
          ]
    });

    return StudentLesson;
}
//