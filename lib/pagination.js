import _ from 'lodash';

const propertyActions = [
  {
    check: (currentPage, lastPage, numberOfLinks) => (lastPage <= numberOfLinks),
    getValues: (currentPage, lastPage) => ({ start: 1, end: lastPage }),
  },
  {
    check: (currentPage, lastPage, numberOfLinks) => (currentPage < numberOfLinks),
    getValues: (currentPage, lastPage, numberOfLinks) => ({ start: 1, end: numberOfLinks }),
  },
  {
    check: (currentPage, lastPage, numberOfLinks) => (
      currentPage > ((lastPage - numberOfLinks) + 1)
    ),
    getValues: (currentPage, lastPage, numberOfLinks) => (
      { start: ((lastPage - numberOfLinks) + 1), end: lastPage }
    ),
  },
  {
    check: () => true,
    getValues: (currentPage, lastPage, numberOfLinks, step) => (
      { start: currentPage - step, end: currentPage + step }
    ),
  },
];

const getPropertyAction = (currentPage, lastPage, numberOfLinks, step) => (
  _.find(propertyActions, ({ check }) => check(currentPage, lastPage, numberOfLinks, step))
);

export default (query, count) => {
  const { offset = 0, limit = 10 } = query;
  const currentPage = Math.floor(offset / limit) + 1;
  const lastPage = Math.ceil(count / limit);
  const numberOfLinks = 5;
  const step = 2;
  const { getValues } = getPropertyAction(currentPage, lastPage, numberOfLinks);
  const { start, end } = getValues(currentPage, lastPage, numberOfLinks, step);
  const chunk = [];
  for (let i = start; i <= end; i += 1) {
    chunk.push({
      number: i,
      isActive: i === currentPage,
      query: { ...query, offset: (i - 1) * limit },
    });
  }
  const endOffset = (lastPage - 1) * limit;
  const lastLink = { query: { ...query, offset: endOffset } };
  const firstLink = ({ query: { ...query, offset: 0 } });
  return { lastLink, firstLink, chunk };
};
