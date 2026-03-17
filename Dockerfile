FROM node:20-bookworm-slim

WORKDIR /app

ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1
ENV STORAGE_ROOT=/app/storage-data

RUN apt-get update \
  && apt-get install -y --no-install-recommends postgresql-client ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
COPY prisma ./prisma

RUN npm install --include=dev --no-audit --no-fund
RUN npx prisma generate

COPY . .

RUN npm run build

ENV NODE_ENV=production

RUN mkdir -p /app/storage-data \
  && chmod +x /app/scripts/docker-entrypoint.sh /app/scripts/export-db.sh /app/scripts/import-db.sh

EXPOSE 3000

ENTRYPOINT ["/app/scripts/docker-entrypoint.sh"]
CMD ["npm", "run", "start"]
