FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

EXPOSE 5000

ENV PORT=5000
ENV USE_IN_MEMORY_DB=true

CMD ["node", "server.js"]

