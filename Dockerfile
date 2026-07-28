# ── Etapa 1: Compilar TypeScript ──────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN apk add --no-cache openssl

# Instalamos dependencias y generamos el cliente de Prisma
RUN npm install
RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

# ── Etapa 2: Imagen de producción ─────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

COPY package*.json ./
COPY prisma ./prisma/

RUN apk add --no-cache openssl || apk add --no-cache openssl || apk add --no-cache openssl

# Solo instalamos dependencias de producción y compilamos Prisma
RUN npm install --only=production && npx prisma generate

COPY --from=builder /app/dist ./dist

EXPOSE 8080

USER node

CMD ["node", "dist/server.js"]