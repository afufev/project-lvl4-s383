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

export const getFilteredTasks = async (filter) => {
  let tasks;
  if (filter.group) {
  // having + group gives out only one tag of many because of GROUP BY, [TODO]: fix scope
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

// const scopeTable = {
//   statusId: 'status',
//   assigneeId: 'assignee',
//   creatorId: 'creator',
// };
//
// export const getFilteredTasks = async (filter) => {
//   const scopes = _.keys(filter)
//     .filter(key => scopeTable[key] !== undefined && filter[key] !== null)
//     .map(key => ({ method: [scopeTable[key], filter[key]] }));
//
//   if (filter.tags === null) {
//     const finalScope = [...scopes, { method: ['filtered', filter] }];
//     console.log(finalScope);
//     const { rows, count } = await Task.scope(finalScope).findAndCountAll();
//     return { tasks: rows, count };
//   }
//   // scope 'tags' gives out only one tag of many because of GROUP BY, [TODO]: fix scope
//
//   const finalScope = [...scopes, { method: ['filtered', filter] }, { method: ['tags', filter.tags] }];
//   const { rows, count } = await Task.scope(finalScope).findAndCountAll();
//   const promises = rows.map(task => task.getTags()
//     .then(tags => ({ ...task, Tags: tags })));
//   const tasks = await Promise.all(promises);
//   return { tasks, count };
// };

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
      value: () => (statusId === 'any' ? null : Number(statusId)),
    },
    {
      key: 'assigneeId',
      value: () => (assigneeId === 'any' ? null : Number(assigneeId)),
    },
    {
      key: 'creatorId',
      value: () => (creatorId === 'any' ? null : Number(creatorId)),
    },
  ];
  const sanitizedQuery = queryProperties.reduce(
    (acc, obj) => ({ ...acc, [obj.key]: obj.value() }), {},
  );
  return sanitizedQuery;
};
