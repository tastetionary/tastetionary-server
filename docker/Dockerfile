FROM node:26-alpine
WORKDIR /usr/src/app

RUN apk update && apk add --no-cache bash openssl ca-certificates

COPY package*.json ./
COPY prisma ./prisma/


RUN which npm && npm --version

RUN npm ci
RUN npx prisma generate

COPY . .
RUN npm run build

EXPOSE 8080
CMD ["node", "dist/src/main.js"]