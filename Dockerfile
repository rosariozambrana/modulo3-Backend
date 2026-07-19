# ── Etapa 1: Compilar TypeScript ──────────────────────────────
FROM node:20-slim AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

# ── Etapa 2: Imagen de producción ─────────────────────────────
FROM node:20-slim AS production

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --only=production && npx prisma generate

COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production

EXPOSE 8080

USER node

CMD ["node", "dist/server.js"]
