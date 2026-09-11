FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY index.js .
CMD ["node", "index.js"]
ENV PORT=3000
EXPOSE 3000