FROM node:20-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    chromium \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libxkbcommon0 \
    libpango-1.0-0 \
    libcairo2 \
    libasound2 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY src/ ./src/

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 3001

# Start server
CMD ["npm", "start"]
