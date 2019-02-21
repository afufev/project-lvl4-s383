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

  Task.loadScopes = (models) => {
    Task.addScope('default', {
      include: [
        { model: models.User, as: 'creator' },
        { model: models.User, as: 'assignee' },
        { model: models.TaskStatus, as: 'status' },
        { model: models.Tag },
      ],
    });

    Task.addScope('filtered', (filter) => {
      console.log(`INSIDE MODEL: ${JSON.stringify(filter)}`);
      const {
        limit, offset, order, tags, statusId, assigneeId, creatorId,
      } = filter;
      // const tagsQuery = tags === null ? tags : { name: tags };
      return ({
        include: [
          { model: models.User, as: 'creator', where: creatorId },
          { model: models.User, as: 'assignee', where: assigneeId },
          { model: models.TaskStatus, as: 'status', where: statusId },
          // { model: models.Tag, where: tagsQuery },
        ],
        order,
        offset,
        limit,
      });
    });

    Task.addScope('tags', (tags) => {
      console.log(`INSIDE MODEL TAGS: ${JSON.stringify(tags)}`);
      return ({
        include: [
          {
            model: models.Tag,
            where: { name: { [sequelize.Op.or]: tags } },
            group: ['Task.id'],
            having: sequelize.where(sequelize.fn('COUNT', sequelize.col('*')), { [sequelize.Op.gte]: tags.length }),
          },
        ],
        // having: sequelize.literal(`count(Tag.id) = ${tags.length}`),
      });
    });
  };

     // having: sequelize.where(sequelize.fn('max', sequelize.col('guarantees.end_date')), {
     //        $lte: sequelize.fn('now'),
     //      })

  // SELECT tasks.id, tasks.name FROM tasks
  // JOIN tasktags ON tasks.id=tasktags.task_id
  // JOIN tags ON tasktags.tag_id=tags.id
  // WHERE tags.name IN (tags)
  // GROUP BY tasks.id
  // HAVING count(*) = `{tags.length}`;

  return Task;
};
