FROM node:18-alpine

WORKDIR /app

ENV PORT=5000

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "start"]