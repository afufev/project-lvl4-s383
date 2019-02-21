import _ from 'lodash';

import { Tag, Task, sequelize } from '../models';

export const getTagsFromQuery = tagsQuery => _.words(tagsQuery, /[A-Za-z0-9_]+/g);

export const findOrCreateTags = async (formTags) => {
  const tagArray = getTagsFromQuery(formTags);
  const getPromises = t => tagArray.map(
    tag => Tag.findOrCreate({ where: { name: tag }, transaction: t }),
  );
  const tagInstances = sequelize.transaction(t => Promise.all(getPromises(t)));
  const normalizedInstances = _.without(_.flattenDeep(tagInstances), true, false);
  const waitToResolve = new Promise(resolve => setTimeout(resolve, 0)); // give time or errors
  await waitToResolve;
  return normalizedInstances;
};

export const buildFilter = (query) => {
  const {
    limit = 25, offset = 0, order = null, tagsQuery = '', statusId = 'all', assigneeId = 'all', creatorId = 'all',
  } = query;
  const tags = getTagsFromQuery(tagsQuery);
  const filterProperties = [
    {
      key: 'limit',
      value: () => (limit === 25 ? limit : Number(limit)),
    },
    {
      key: 'offset',
      value: () => (offset === 0 ? offset : Number(offset)),
    },
    {
      key: 'order',
      value: () => (order === null ? [['createdAt', 'DESC']] : order),
    },
    {
      key: 'tags',
      value: () => (tags.length === 0 ? null : tags),
    },
    {
      key: 'statusId',
      value: () => (statusId === 'all' ? null : { id: Number(statusId) }),
    },
    {
      key: 'assigneeId',
      value: () => (assigneeId === 'all' ? null : { id: Number(assigneeId) }),
    },
    {
      key: 'creatorId',
      value: () => (creatorId === 'all' ? null : { id: Number(creatorId) }),
    },
  ];
  const filter = filterProperties.reduce((acc, obj) => ({ ...acc, [obj.key]: obj.value() }), {});
  return filter;
};

export const getFilteredTasks = async (filter) => {
  const tasks = (filter.tags === null || filter.tags.length <= 1)
    ? await Task.scope({ method: ['filtered', filter] }).findAll()
    : await Task.scope({ method: ['tags', filter.tags] }, { method: ['filtered', filter] }).findAll();
  return tasks;
};
