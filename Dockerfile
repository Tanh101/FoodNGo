FROM node:16

WORKDIR /usr/src/app


COPY package*.json ./

RUN npm install

COPY .env ./

COPY . .

EXPOSE 8000

CMD [ "node", "./src/index.js" ]
