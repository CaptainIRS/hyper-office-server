FROM node:16-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

EXPOSE 3000

ENV DB_HOST=cassandra

CMD [ "node", "./bin/www" ]

