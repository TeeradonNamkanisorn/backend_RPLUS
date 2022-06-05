
module.exports = (sequelize, DataTypes) => {
    const StudentCourse = sequelize.define( "studentCourse",{
        id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        status: {
            type: DataTypes.ENUM('NOT_COMPLETED','PREVIOUSLY COMPLETED','COMPLETED'),
            defaultValue: "NOT_COMPLETED"
        },
        certificateUrl: {
            type: DataTypes.STRING
        },
        certificatePublicId: {
            type: DataTypes.STRING
        },
        latestCompletedDate: {
            type: DataTypes.DATEONLY
        },
        price: {
            type: DataTypes.FLOAT,
            allowNull: false
        }
    }, {
        indexes: [
            { fields: ['studentId', 'courseId'], unique: true }
          ]
    })
    return StudentCourse;
}