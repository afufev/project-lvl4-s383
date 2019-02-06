FROM node:11.9

RUN apt-get install -yq libsqlite3-0
RUN npm install -g npm-check-updates
WORKDIR /code
