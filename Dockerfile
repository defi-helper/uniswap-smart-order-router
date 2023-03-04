from node:18-alpine

WORKDIR /usr/src/app
RUN mkdir -p /user/src/app/node_modules \
    && chown -R node:node /usr/src/app

COPY package*.json ./
USER node
RUN npm ci

COPY --chown=node:node . .
RUN npm run build

STOPSIGNAL SIGQUIT
EXPOSE 80
CMD [ "node", "dist/index.js" ]