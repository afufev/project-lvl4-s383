import {
  User, TaskStatus, Tag, sequelize,
} from '../models';
import { getTagsFromQuery } from './util';

export default (query) => {
  const {
    offset, orderBy, orderDirection,
    tagsQuery, statusId, assigneeId, creatorId,
  } = query;
  const tags = getTagsFromQuery(tagsQuery);
  const includeValues = [
    () => (statusId === 'any'
      ? { model: TaskStatus, as: 'status' }
      : { model: TaskStatus, as: 'status', where: { id: statusId } }
    ),
    () => (assigneeId === 'any'
      ? { model: User, as: 'assignee' }
      : { model: User, as: 'assignee', where: { id: assigneeId } }
    ),
    () => (creatorId === 'any'
      ? { model: User, as: 'creator' }
      : { model: User, as: 'creator', where: { id: creatorId } }
    ),
    () => (tags.length === 0
      ? { model: Tag }
      : { model: Tag, where: { name: { [sequelize.Op.or]: tags } } }
    ),
  ];
  const priorFilter = { offset, limit: 10, order: [[orderBy, orderDirection]] };
  const include = includeValues.map(value => value());
  const filter = { ...priorFilter, include };
  if (tags.length > 1) {
    filter.group = ['Task.id'];
    filter.having = sequelize.where(sequelize.fn('COUNT', sequelize.col('*')), { [sequelize.Op.gte]: tags.length });
    filter.subQuery = false;
  }
  return filter;
};
