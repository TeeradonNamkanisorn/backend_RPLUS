

module.exports = (sequelize, DataTypes) => {
    const Teacher = sequelize.define("teacher", {
        username: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            unique: true,
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
        }
    });

    Teacher.associate = models => {
        Teacher.hasMany(models.Course, {
            onDelete: "RESTRICT",
            onUpdate: "RESTRICT"
        })
    }

    return Teacher;
}