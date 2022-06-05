//Define unique conditions by indexes
module.exports = (sequelize, DataTypes) => {
    const Course = sequelize.define("course", {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
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
        length: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        isPublished: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        price: {
            type: DataTypes.FLOAT,
            defaultValue: 10.0
        }
    }, {
        indexes:[
            {unique:true, fields: ['name']
        }]
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
        Course.belongsToMany(models.Student, {
            through: models.StudentCourse,
            onDelete: "RESTRICT",
            onUpdate: "RESTRICT"
        })
    }
    return Course
}