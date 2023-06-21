FROM node:18-alpine

COPY ["package.json", "package-lock.json*", "./"]

RUN npm i

COPY . .

RUN npm run build

CMD ["npm", "start"]