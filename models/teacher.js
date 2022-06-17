
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
            type: DataTypes.STRING,
            allowNull: false
        },
        firstName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        creditCardName: {
            type: DataTypes.STRING,
        },
        bankCode: {
            type: DataTypes.STRING,
            defaultValue: "bbl"
        }
    },{
        indexes:[
            {
                unique:true, fields: ['email']
        }, {
                unique: true, fields: ['creditCardNumber']
        }
    ]}
        );

    Teacher.associate = models => {
        Teacher.hasMany(models.Course, {
            onDelete: "RESTRICT",
            onUpdate: "RESTRICT"
        })
    }

    return Teacher;
}