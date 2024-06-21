FROM node:20
LABEL authors="jefaokpta"

# Defina o diretório de trabalho
WORKDIR /app

# Copie os arquivos package.json e package-lock.json
COPY package*.json ./

# Instale as dependências do projeto
RUN npm install

# Copie o restante dos arquivos do projeto
COPY src/ ./src

# Exponha a porta que o aplicativo usará
EXPOSE 3000

## todo: instalar python e whisper
# Defina o comando para iniciar o aplicativo
CMD [ "npm", "run", "start" ]