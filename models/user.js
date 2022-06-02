module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('user', {
        username: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            unique: true
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        imageUrl: {
            type: DataTypes.STRING
        },
        id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        role: {
            type: DataTypes.ENUM('teacher', 'student')
        }
    });

    User.associate = (models) => {
        User.hasOne(models.Teacher, {
            onDelete: "RESTRICT",
            onUpdate: "RESTRICT"
        });
    }

    return User;
}