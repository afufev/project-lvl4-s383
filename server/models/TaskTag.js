export default (sequelize, DataTypes) => {
  const TaskTag = sequelize.define('TaskTag', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    taskId: DataTypes.INTEGER,
    tagId: DataTypes.INTEGER,
  }, {});
  return TaskTag;
};
