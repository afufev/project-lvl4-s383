import { sequelize } from '../models';
import getPaginationObject from '../lib/pagination';

import { seedUsers, seedStatuses, preparePaginationTasks } from './helpers';


describe('task pagination', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
    await seedUsers();
    await seedStatuses();
    await preparePaginationTasks();
  });

  const pagesArr = [
    { number: 1, firstButton: 1, lastButton: 5 },
    { number: 3, firstButton: 1, lastButton: 5 },
    { number: 5, firstButton: 3, lastButton: 7 },
    { number: 8, firstButton: 6, lastButton: 10 },
    { number: 11, firstButton: 9, lastButton: 13 },
    { number: 15, firstButton: 13, lastButton: 17 },
    { number: 16, firstButton: 14, lastButton: 18 },
    { number: 17, firstButton: 16, lastButton: 20 },
    { number: 20, firstButton: 16, lastButton: 20 },
  ];

  pagesArr.map(({ number, firstButton, lastButton }) => it(`check page ${number}`, async () => {
    const limit = 10;
    const query = { offset: ((number - 1) * limit) };
    const { chunk } = await getPaginationObject(query);
    const [firstEl] = chunk;
    const [lastEl] = chunk.slice(-1);

    expect(firstEl.number).toBe(firstButton);
    expect(lastEl.number).toBe(lastButton);
  }));
});
