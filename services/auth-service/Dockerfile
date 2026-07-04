FROM node:22-slim

WORKDIR app/

copy package*.json ./

RUN npm ci

copy . .

EXPOSE 3000

CMD ["npm","run","dev"]



