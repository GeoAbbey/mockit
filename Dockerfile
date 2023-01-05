FROM node:16-alpine3.14

ARG NODE_ENV
# ENV NODE_ENV=$NODE_ENV
ENV NODE_ENV=${NODE_ENV:-production}
ENV PORT 4000
EXPOSE 4000
RUN mkdir -p /usr/src/app
ENV HOME /usr/src/app
WORKDIR $HOME



COPY . $HOME

RUN npm install
ENTRYPOINT npm run start-${NODE_ENV}
# ENTRYPOINT npm run start-production

