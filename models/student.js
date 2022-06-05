//Define unique conditions by indexes
module.exports = (sequelize, DataTypes) => {
    const Student = sequelize.define("student", {
        username: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        imageUrl: {
            type: DataTypes.STRING
        },
        imagePublicId: {
            type: DataTypes.STRING
        },
        id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        creditCardNumber: {
            type: DataTypes.STRING
        },
        firstName: {
            type: DataTypes.STRING,
            allowNull : false
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {indexes:[{unique:true, fields: ['email']}]})

    Student.associate = (models) => {
        Student.belongsToMany(models.Course, {
            through: models.StudentCourse,
            onDelete: "RESTRICT",
            onUpdate: "RESTRICT"
        });
        Student.belongsToMany(models.Lesson, {
            through: models.StudentLesson,
            onDelete: "RESTRICT",
            onUpdate: "RESTRICT"
        })
    }

    return Student;
}