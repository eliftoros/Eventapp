FROM node:22-alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy package manifests
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application files
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Start the Vite development server binding to 0.0.0.0
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
