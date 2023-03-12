FROM node:16-alpine AS build

WORKDIR /app

ARG NODE_ENV
ENV NODE_ENV ${NODE_ENV:-production}

COPY package*.json ./
RUN npm ci
COPY . .

FROM node:16-alpine
WORKDIR /app
COPY . .
COPY --from=build /app/node_modules ./node_modules
EXPOSE 8080

CMD [ "node","./dist/index.js" ]
