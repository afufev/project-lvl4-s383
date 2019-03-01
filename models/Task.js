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

  Task.addScope('filtered', (filter) => {
    const {
      limit, offset, orderBy, orderDirection, tags, statusId, assigneeId, creatorId,
    } = filter;
    const order = [[orderBy, orderDirection]];
    const tagsWhere = tags === null ? tags : { name: tags };
    return ({
      include: [
        { model: sequelize.models.User, as: 'creator', where: creatorId },
        { model: sequelize.models.User, as: 'assignee', where: assigneeId },
        { model: sequelize.models.TaskStatus, as: 'status', where: statusId },
        { model: sequelize.models.Tag, where: tagsWhere },
      ],
      order,
      offset,
      limit,
      distinct: true,
    });
  });

  // this scope is supposed to find all tasks with all provided tags, not only with one of many
  // should work like this:
  // SELECT tasks.id, tasks.name FROM tasks
  // JOIN tasktags ON tasks.id=tasktags.task_id
  // JOIN tags ON tasktags.tag_id=tags.id
  // WHERE tags.name IN (tags)
  // GROUP BY tasks.id
  // HAVING count(*) = `{tags.length}`;
  Task.addScope('tags', tags => ({
    group: ['Task.id'],
    having: sequelize.where(sequelize.fn('COUNT', sequelize.col('*')), { [sequelize.Op.gte]: tags.length }),
    subQuery: false,
    include: [
      { model: sequelize.models.Tag, where: { name: { [sequelize.Op.or]: tags } } },
    ],
  }));

  return Task;
};
