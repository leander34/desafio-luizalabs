# Usar imagem oficial do Node.js
FROM node:20.18.1

# Definir o diretório de trabalho
WORKDIR /usr/src/app

# Copiar os arquivos de dependências e instalar
COPY package*.json ./
RUN npm install

# Copiar o restante dos arquivos
COPY . .

# Compilar o código usando o script definido no package.json
RUN npm run build

# Usar o script "start" para rodar o worker
CMD ["npm", "start"]