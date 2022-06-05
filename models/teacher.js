
//Define unique conditions by indexes
module.exports = (sequelize, DataTypes) => {
    const Teacher = sequelize.define("teacher", {
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
            allowNull: false
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: false
        }
    },{
        indexes:[
            {unique:true, fields: ['email']
        }]}
        );

    Teacher.associate = models => {
        Teacher.hasMany(models.Course, {
            onDelete: "RESTRICT",
            onUpdate: "RESTRICT"
        })
    }

    return Teacher;
}