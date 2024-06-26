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

RUN apt-get update \
    && apt-get -y install ffmpeg \
    && apt-get -y install python3.11-venv \
    && python3 -m venv venv \
    && apt-get clean

ENV PATH="venv/bin:$PATH"

RUN pip3 install --upgrade pip \
    && pip3 install git+https://github.com/openai/whisper.git


# Defina o comando para iniciar o aplicativo
CMD [ "npm", "run", "start" ]