
module.exports = (sequelize, DataTypes) => {
    const StudentCourse = sequelize.define( "studentCourse",{
        id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        status: {
            type: DataTypes.ENUM('NOT_COMPLETED','PREVIOUSLY_COMPLETED','COMPLETED'),
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
        },
        teacherEarningTHB: {
            type: DataTypes.FLOAT
            //Amount in THB
        },
        chargeId: {
            type: DataTypes.STRING,
            allowNull: false
        },
        studentId: {
            type: DataTypes.STRING,
            references: {
              model: "students",
              key: 'id'
            }
          },
        courseId: {
            type: DataTypes.STRING,
            references: {
              model: "courses", 
              key: 'id'
            }
        }
        
    }, {
        indexes: [
            { fields: ['studentId', 'courseId'], unique: true }
          ]
    })
    return StudentCourse;
    //
}

