FROM node:20.18.1

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

RUN npm run build

CMD ["sh", "-c", "npm run setup && npm start"]
