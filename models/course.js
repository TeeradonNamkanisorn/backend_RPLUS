
module.exports = (sequelize, DataTypes) => {
    const Course = sequelize.define("course", {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        imageLink: {
            type: DataTypes.STRING
        },
        imagePublicId: {
            type: DataTypes.STRING
        },
        videoLink: {
            type: DataTypes.STRING
        },
        videoPublicId: {
            type: DataTypes.STRING
        },
        description: {
            type: DataTypes.STRING
        },
        level: {
            type: DataTypes.ENUM('all', 'beginner', 'intermediate', 'advanced'),
            defaultValue: "all"
        },
        price: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0
        },
        length: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        isPublished: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    });

    Course.associate = (models) => {
        Course.belongsTo(models.Teacher, {
            onDelete: "RESTRICT",
            onUpdate: "RESTRICT"
        });
        Course.hasMany(models.Chapter, {
            onDelete: "RESTRICT",
            onUpdate: "RESTRICT"
        });
    }
    return Course
}