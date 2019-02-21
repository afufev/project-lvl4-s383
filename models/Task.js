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
  Task.associate = (models) => {
    Task.belongsTo(models.User, { as: 'creator' });
    Task.belongsTo(models.User, { as: 'assignee' });
    Task.belongsTo(models.TaskStatus, { as: 'status' });
    Task.belongsToMany(models.Tag, { through: 'TaskTag', foreignKey: 'taskId' });
  };

  // Task.addScope('default', {
  //   include: [
  //     { model: sequelize.models.User, as: 'creator' },
  //     { model: sequelize.models.User, as: 'assignee' },
  //     { model: sequelize.models.TaskStatus, as: 'status' },
  //     { model: sequelize.models.Tag },
  //   ],
  // });

  Task.addScope('filtered', (filter) => {
    const {
      limit, offset, order, tags, statusId, assigneeId, creatorId,
    } = filter;
    const tagsQuery = tags === null ? tags : { name: tags };
    return ({
      include: [
        { model: sequelize.models.User, as: 'creator', where: creatorId },
        { model: sequelize.models.User, as: 'assignee', where: assigneeId },
        { model: sequelize.models.TaskStatus, as: 'status', where: statusId },
        { model: sequelize.models.Tag, where: tagsQuery },
      ],
      order,
      offset,
      limit,
      subQuery: false,
    });
  });

  // this scope is supposed to find all tasks with all provided tags, not with only one
  Task.addScope('tags', tags => ({
    group: ['Task.id'],
    having: sequelize.where(sequelize.fn('COUNT', sequelize.col('*')), { [sequelize.Op.gte]: tags.length }),
    include: [
      { model: sequelize.models.Tag, where: { name: { [sequelize.Op.or]: tags } } },
    ],
  }));

  // SELECT tasks.id, tasks.name FROM tasks
  // JOIN tasktags ON tasks.id=tasktags.task_id
  // JOIN tags ON tasktags.tag_id=tags.id
  // WHERE tags.name IN (tags)
  // GROUP BY tasks.id
  // HAVING count(*) = `{tags.length}`;

  return Task;
};
