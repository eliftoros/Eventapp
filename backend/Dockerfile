FROM node:22-alpine

# Set the working directory
WORKDIR /usr/src/app

# Install native compilation dependencies for packages like bcrypt
RUN apk add --no-cache python3 make g++

# Copy package dependency manifests
COPY package*.json ./

# Install packages
RUN npm ci

# Copy Prisma schema and migrations
COPY prisma ./prisma/

# Generate the Prisma Client
RUN npx prisma generate

# Copy the rest of the application files
COPY . .

# Build the NestJS app
RUN npm run build

# Expose backend port
EXPOSE 3000

# Ensure the uploads directory exists, run migrations, and start the app
CMD ["sh", "-c", "mkdir -p uploads && npx prisma migrate deploy && npm run start:prod"]
