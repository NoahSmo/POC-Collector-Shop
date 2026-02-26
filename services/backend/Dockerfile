FROM node:20-alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

# Copy the rest of the application
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Production Stage
FROM node:20-alpine

WORKDIR /usr/src/app

# Install openssl for prisma and testing
RUN apk add --no-cache openssl

# Install dependencies (including dev for prisma CLI)
COPY package*.json ./
RUN npm ci

# Copy dist from build
COPY --from=build /usr/src/app/dist ./dist
# Copy prisma schema
COPY prisma ./prisma

# Generate Prisma Client
RUN npx prisma generate

# Copy start script
COPY start.sh ./
RUN chmod +x start.sh

EXPOSE 3000

CMD ["./start.sh"]
