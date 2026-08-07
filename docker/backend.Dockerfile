FROM node:20-alpine

WORKDIR /app

COPY backend/package*.json ./backend/
COPY ai-engine/package*.json ./ai-engine/
RUN cd backend && npm install --omit=dev
RUN cd ai-engine && npm install --omit=dev

COPY ai-engine ./ai-engine
COPY backend ./backend

WORKDIR /app/backend
RUN mkdir -p uploads logs

EXPOSE 5000
CMD ["node", "server.js"]
