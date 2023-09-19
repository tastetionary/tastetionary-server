FROM node:18-alpine

WORKDIR /usr/src/app
COPY package*.json .
COPY prisma ./prisma/

RUN apk update && apk add bash 
RUN npm ci
RUN npx prisma generate

COPY . .

EXPOSE 8080


# ENTRYPOINT ["node"]
CMD ["npm", "run", "start:dev"]
