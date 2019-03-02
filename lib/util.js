import _ from 'lodash';

import { Tag, Task, sequelize } from '../models';

export const getTagsFromQuery = tagsQuery => _.words(tagsQuery, /[A-Za-z0-9_]+/g);

export const findOrCreateTags = async (formTags) => {
  const tagArray = getTagsFromQuery(formTags);
  const getPromises = t => tagArray.map(
    tag => Tag.findOrCreate({ where: { name: tag }, transaction: t }),
  );
  const tagInstances = await sequelize.transaction(t => Promise.all(getPromises(t)));
  const normalizedInstances = _.without(_.flattenDeep(tagInstances), true, false);
  const waitToResolve = new Promise(resolve => setTimeout(resolve, 0)); // give time or errors
  await waitToResolve;
  return normalizedInstances;
};


// findAndCountAll doesn't work properly with postgreSQL ->
// -> it counts entries with 'included' and without repeatedly
// if add 'distinct: true' -> returns error in case there is no 'where' clause inside any of include
// such errors doesn't occur in SQLite
// it's easier to prepare full filter and send it into findALl and Count separately

export const findAndCountAllTasks = async (filter) => {
  let tasks;
  if (filter.group) {
    const tasksWithoutTags = await Task.findAll(filter);
    const promises = tasksWithoutTags.map(task => task.getTags()
      .then(tags => ({ ...task, Tags: tags })));
    tasks = await Promise.all(promises);
  } else {
    tasks = await Task.findAll(filter);
  }
  const count = await Task.count({
    include: filter.include,
    distinct: true,
  });
  return { tasks, count };
};

const getDirection = (orderBy, prevOrderBy, prevDirection) => {
  const reversedDirection = {
    DESC: 'ASC',
    ASC: 'DESC',
  };
  return orderBy === prevOrderBy
    ? reversedDirection[prevDirection]
    : 'DESC';
};

export const sanitizeQuery = (query) => {
  const {
    offset = 0,
    orderBy = null, prevOrderBy, prevDirection,
    tagsQuery = '', statusId = 'any', assigneeId = 'any', creatorId = 'any',
  } = query;
  const queryProperties = [
    {
      key: 'offset',
      value: () => (offset === 0 ? offset : Number(offset)),
    },
    {
      key: 'orderBy',
      value: () => (orderBy === null ? 'createdAt' : orderBy),
    },
    {
      key: 'orderDirection',
      value: () => (getDirection(orderBy, prevOrderBy, prevDirection)),
    },
    {
      key: 'tagsQuery',
      value: () => (tagsQuery.length !== 0 && typeof tagsQuery === 'string' ? tagsQuery : ''),
    },
    {
      key: 'statusId',
      value: () => (statusId === 'any' ? statusId : Number(statusId)),
    },
    {
      key: 'assigneeId',
      value: () => (assigneeId === 'any' ? assigneeId : Number(assigneeId)),
    },
    {
      key: 'creatorId',
      value: () => (creatorId === 'any' ? creatorId : Number(creatorId)),
    },
  ];
  const sanitizedQuery = queryProperties.reduce(
    (acc, obj) => ({ ...acc, [obj.key]: obj.value() }), {},
  );
  return sanitizedQuery;
};
