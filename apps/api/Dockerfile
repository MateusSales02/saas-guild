# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Instala pnpm
RUN npm install -g pnpm

# Copia arquivos de dependências
COPY package.json pnpm-lock.yaml ./

# Instala TODAS as dependências (incluindo devDependencies para build)
RUN pnpm install --frozen-lockfile

# Copia código fonte
COPY . .

# Compila TypeScript
RUN pnpm run build

# Copia arquivo JSON para o diretório dist após build
RUN mkdir -p dist/data && cp src/data/albion-items.json dist/data/

# Stage 2: Production
FROM node:20-alpine AS production

WORKDIR /app

# Instala pnpm
RUN npm install -g pnpm

# Copia arquivos de dependências
COPY package.json pnpm-lock.yaml ./

# Instala apenas dependências de produção
RUN pnpm install --frozen-lockfile --prod

# Copia código compilado do stage anterior (incluindo dist/data/)
COPY --from=builder /app/dist ./dist

# Copia package.json para produção (não precisa copiar .env pois usamos variáveis de ambiente)

# Usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 -G nodejs && \
    chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 3000

CMD ["node", "dist/main.js"]
