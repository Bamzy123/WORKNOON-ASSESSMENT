FROM node:22-bookworm-slim
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN mkdir -p /app/data
EXPOSE 8000
CMD ["npm","start"]
