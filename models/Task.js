export default (sequelize, DataTypes) => {
  const Task = sequelize.define('Task', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { arg: true, msg: 'Task name can\'t be empty' },
      },
    },
    description: DataTypes.TEXT,
  }, {});
  // foreignKeys are obligatory:
  // sequelize + postgreSQL throw error ' error: column Task.UserId does not exist' and etc
  Task.associate = (models) => {
    Task.belongsTo(models.User, { as: 'creator', foreignKey: 'creatorId' });
    Task.belongsTo(models.User, { as: 'assignee', foreignKey: 'assigneeId' });
    Task.belongsTo(models.TaskStatus, { as: 'status', foreignKey: 'statusId' });
    Task.belongsToMany(models.Tag, { through: 'TaskTag', foreignKey: 'taskId' });
  };

  Task.addScope('findByPk', id => ({
    where: { id },
    include: [
      { model: sequelize.models.User, as: 'creator' },
      { model: sequelize.models.User, as: 'assignee' },
      { model: sequelize.models.TaskStatus, as: 'status' },
      { model: sequelize.models.Tag },
    ],
  }));

  return Task;
};
