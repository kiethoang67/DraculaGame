FROM node:20-alpine

WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy application source code
COPY . .

# Build typescript
RUN npm run build

# Expose the configured PORT (Fly uses 3001 here)
EXPOSE 3001

CMD ["npm", "start"]
