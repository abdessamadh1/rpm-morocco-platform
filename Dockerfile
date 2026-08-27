# Production Dockerfile for RPM Morocco Backend
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
COPY server/package.json server/package-lock.json* ./server/

RUN cd server && npm ci

COPY server ./server
COPY src/app/shared.tsx ./src/app/shared.tsx

RUN cd server && npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

COPY --from=builder /app/server/package.json ./server/
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/node_modules ./server/node_modules

EXPOSE 5000

CMD ["node", "server/dist/index.js"]
