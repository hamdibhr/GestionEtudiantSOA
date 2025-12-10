FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
# RUN npm install # Commented out until package.json exists
COPY . .
CMD ["npm", "start"]
