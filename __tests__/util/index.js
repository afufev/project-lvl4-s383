import faker from 'faker';
import request from 'supertest';

export const user = {
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  email: faker.internet.email(),
  password: faker.internet.password(),
};

export const unknownUser = {
  email: faker.internet.email(),
  password: faker.internet.password(),
};

export const updatedPassword = {
  currentPassword: user.password,
  newPassword: faker.internet.password(),
};

export const updatedUser = {
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  email: faker.internet.email(),
  password: user.password,
};

export const getCookie = async (server) => {
  const authRes = await request.agent(server)
    .post('/users')
    .send({ form: user });
  return authRes.headers['set-cookie'];
};
