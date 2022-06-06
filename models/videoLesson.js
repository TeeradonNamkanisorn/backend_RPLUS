
module.exports = (sequelize, DataTypes) => {
    const VideoLesson = sequelize.define('videoLesson', {
        title: {
            type: DataTypes.STRING,
            allowNull: false
        }, 
        url: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        videoPublicId: {
            type: DataTypes.STRING
        },
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false
        }, 
        description: {
            type: DataTypes.TEXT,
        },
        duration: {
            type: DataTypes.FLOAT,
            defaultValue: 0
        },
        courseId: {
            type: DataTypes.STRING,
            allowNull: false
        }
    });

    VideoLesson.associate = (models) => {
        VideoLesson.belongsTo(models.Lesson, {
            onDelete: "RESTRICT",
            onUpdate: "RESTRICT"
        });
    }
    return VideoLesson;
}