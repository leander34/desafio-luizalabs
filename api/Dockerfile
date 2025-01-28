FROM node:20.18.1

# RUN apt-get update && apt-get install -y mysql-client

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

# COPY wait-for-it.sh /usr/local/bin/wait-for-it
# RUN chmod +x /usr/local/bin/wait-for-it

RUN npm run build

# Usar dockerize para aguardar o MySQL antes de iniciar a aplicação
# CMD ["wait-for-it", "mysql:3306", "--", "sh", "-c", "npm run setup && npm start"]
CMD ["sh", "-c", "npm run setup && npm start"]
