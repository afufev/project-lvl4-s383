export default (sequelize, DataTypes) => {
  const TaskStatus = sequelize.define('TaskStatus', {
    name: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        notEmpty: { arg: true, msg: 'Status can\'t be blanc' },
      },
    },
  }, {});
  TaskStatus.associate = (models) => {
    TaskStatus.hasMany(models.Task, { as: 'status' });
  };
  return TaskStatus;
};
