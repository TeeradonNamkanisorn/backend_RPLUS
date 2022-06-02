module.exports = (sequelize, DataTypes) => {
    const Chapter = sequelize.define('chapter', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    }, 
    chapterIndex: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    }
});
    Chapter.associate = (models) => {
        Chapter.belongsTo(models.Course,{
            onDelete: "RESTRICT",
            onUpdate: "RESTRICT"
        })
        Chapter.hasMany(models.Lesson, {
            onDelete: "RESTRICT",
            onUpdate: "RESTRICT"
        })
    }
return Chapter;
}

