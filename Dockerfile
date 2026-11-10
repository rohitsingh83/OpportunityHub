FROM node:20-alpine AS build

WORKDIR /app

# Copy root and subproject package manifests
COPY package.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN npm install --prefix backend --omit=dev
RUN npm install --prefix frontend

# Copy source
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# Build React production bundle into frontend/dist
RUN npm run build --prefix frontend

EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000

CMD ["node", "backend/server.js"]
