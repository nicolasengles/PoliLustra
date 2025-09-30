# ---- Estágio de Desenvolvimento ----

# Começamos com uma imagem oficial e estável do Node.js (versão 20 LTS - Long Term Support).
# A tag '-alpine' refere-se a uma versão muito leve do Linux, ideal para contêineres.
FROM node:20-alpine

# Define o diretório de trabalho padrão dentro do contêiner.
# Todos os comandos a seguir serão executados a partir daqui.
WORKDIR /app

# Copia os ficheiros de gestão de pacotes primeiro.
# O '*' garante que tanto package.json quanto package-lock.json sejam copiados.
# Isto é uma otimização: as dependências só serão reinstaladas se estes ficheiros mudarem.
COPY package*.json ./

# Instala TODAS as dependências listadas no package.json, incluindo as de desenvolvimento como o nodemon.
# O 'npm install' lê o package-lock.json para garantir versões exatas.
RUN npm install

# Copia todo o resto do código do projeto para o diretório de trabalho no contêiner.
# Os ficheiros listados no .dockerignore (como node_modules e .env) serão ignorados.
COPY . .

# Expõe a porta 3000, que é a porta que o nosso servidor Express irá usar dentro do contêiner.
EXPOSE 3000

# O comando padrão que será executado para iniciar a aplicação quando o contêiner arrancar.
# 'npm run dev' irá executar o 'nodemon server.js' conforme definido no package.json.
CMD [ "npm", "run", "dev" ]