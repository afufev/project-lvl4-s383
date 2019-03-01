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

export const getFilteredTasks = (filter) => {
  if (filter.tags === null || filter.tags.length <= 1) {
    return Task.scope({ method: ['filtered', filter] }).findAndCountAll();
  }
  // scope 'tags' gives out only one tag of many because of GROUP BY, [TODO]: fix scope
  const tasks = Task.scope({ method: ['filtered', filter] }, { method: ['tags', filter.tags] }).findAndCountAll();
  const tasksWithTags = tasks.map(async (task) => {
    const tags = await task.getTags();
    return { ...task, Tags: tags };
  });
  return tasksWithTags;
};
