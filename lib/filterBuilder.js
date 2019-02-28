import { getTagsFromQuery } from './util';

const getDirection = (orderBy, prevOrderBy, prevDirection) => {
  const reversedDirection = {
    DESC: 'ASC',
    ASC: 'DESC',
  };
  return orderBy === prevOrderBy
    ? reversedDirection[prevDirection]
    : 'DESC';
};

export default (query) => {
  const {
    limit = 10, offset = 0,
    orderBy = null, prevOrderBy, prevDirection,
    tagsQuery = '', statusId = 'any', assigneeId = 'any', creatorId = 'any',
  } = query;
  const tags = getTagsFromQuery(tagsQuery);
  const filterProperties = [
    {
      key: 'limit',
      value: () => (limit === 10 ? limit : Number(limit)),
    },
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
      key: 'tags',
      value: () => (tags.length === 0 ? null : tags),
    },
    {
      key: 'statusId',
      value: () => (statusId === 'any' || 'null' ? null : { id: Number(statusId) }),
    },
    {
      key: 'assigneeId',
      value: () => (assigneeId === 'any' || 'null' ? null : { id: Number(assigneeId) }),
    },
    {
      key: 'creatorId',
      value: () => (creatorId === 'any' || 'null' ? null : { id: Number(creatorId) }),
    },
  ];
  const filter = filterProperties.reduce(
    (acc, obj) => ({ ...acc, [obj.key]: obj.value() }), {},
  );
  return filter;
};
