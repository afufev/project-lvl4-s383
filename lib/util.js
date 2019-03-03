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

// [TODO] move to TypeORM
// findAndCountAll doesn't work properly with postgreSQL ->
// -> it counts entries with 'included' and without repeatedly
// if add 'distinct: true' -> returns error in case there is no 'where' clause inside any of include
// such errors doesn't occur in SQLite
// it's easier to prepare full filter and send it into findALl and Count separately

export const findAndCountAllTasks = async (filter) => {
  const tasksWithoutTags = await Task.findAll(filter);
  const promises = tasksWithoutTags.map(task => task.getTags()
    .then(tags => ({ ...task, Tags: tags })));
  const tasks = await Promise.all(promises);
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

const getQueryArr = (offset, orderBy, tagsQuery, statusId, assigneeId, creatorId) => ([
  {
    key: 'offset', check: (offset === 0), passed: offset, failed: Number(offset),
  },
  {
    key: 'orderBy', check: (orderBy === null), passed: 'createdAt', failed: orderBy,
  },
  {
    key: 'tagsQuery',
    check: tagsQuery.length !== 0 && typeof tagsQuery === 'string',
    passed: tagsQuery,
    failed: '',
  },
  {
    key: 'statusId', check: statusId === 'any', passed: statusId, failed: Number(statusId),
  },
  {
    key: 'assigneeId', check: assigneeId === 'any', passed: assigneeId, failed: Number(assigneeId),
  },
  {
    key: 'creatorId', check: creatorId === 'any', passed: creatorId, failed: Number(creatorId),
  },
]);

export const sanitizeQuery = (query) => {
  const {
    offset = 0, orderBy = null, prevOrderBy, prevDirection,
    tagsQuery = '', statusId = 'any', assigneeId = 'any', creatorId = 'any',
  } = query;
  const orderDirection = getDirection(orderBy, prevOrderBy, prevDirection);
  const queryProperties = getQueryArr(offset, orderBy, tagsQuery, statusId, assigneeId, creatorId);
  const preSanitizedQuery = queryProperties.reduce((acc, property) => {
    const value = property.check === true ? property.passed : property.failed;
    return ({ ...acc, [property.key]: value });
  }, {});
  const sanitizedQuery = { ...preSanitizedQuery, orderDirection };
  return sanitizedQuery;
};
