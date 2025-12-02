# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copia arquivos de dependências
COPY package.json package-lock.json ./

# Instala TODAS as dependências (incluindo devDependencies para build)
RUN npm ci

# Copia código fonte
COPY . .

# Compila TypeScript
RUN npm run build

# Garante que o diretório de dados existe após o build
RUN ls -la /app/src/data || echo "ERRO: src/data não existe"

# Stage 2: Production
FROM node:20-alpine AS production

WORKDIR /app

# Copia arquivos de dependências
COPY package.json package-lock.json ./

# Instala apenas dependências de produção
RUN npm ci --omit=dev

# Copia código compilado do stage anterior
COPY --from=builder /app/dist ./dist

# Cria diretório de dados e copia o arquivo JSON
RUN mkdir -p ./dist/data
COPY --from=builder /app/src/data/albion-items.json ./dist/data/

# Copia package.json para produção (não precisa copiar .env pois usamos variáveis de ambiente)

# Usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 -G nodejs && \
    chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 3000

CMD ["node", "dist/main.js"]
