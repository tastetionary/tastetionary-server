FROM node:24-alpine AS builder
WORKDIR /usr/src/app

RUN apk add --no-cache openssl ca-certificates

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci
RUN npx prisma generate

COPY . .
RUN npm run build

RUN npm prune --omit=dev --ignore-scripts

FROM node:24-alpine
WORKDIR /usr/src/app

ENV NODE_ENV=production

RUN apk add --no-cache openssl ca-certificates

COPY --from=builder --chown=node:node /usr/src/app/node_modules ./node_modules
COPY --from=builder --chown=node:node /usr/src/app/dist ./dist
COPY --from=builder --chown=node:node /usr/src/app/packages/api/swagger.json ./packages/api/swagger.json
COPY --from=builder --chown=node:node /usr/src/app/prisma ./prisma
COPY --chown=node:node package*.json ./

RUN mkdir -p logs && chown node:node logs

USER node

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://localhost:' + (process.env.API_SERVER_PORT || 8080) + '/health/healthz').then(function (r) { process.exit(r.ok ? 0 : 1); }).catch(function () { process.exit(1); })"

CMD ["node", "dist/src/main.js"]
