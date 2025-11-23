FROM node:20-alpine

WORKDIR /app

# Copia apenas arquivos essenciais
COPY package.json package-lock.json ./

# Instalações apenas de produção
RUN npm install --omit=dev

# Agora copia o restante do código
COPY . .

# Build (caso seu Nest use build)
RUN npm run build

CMD ["npm", "run", "start:prod"]
