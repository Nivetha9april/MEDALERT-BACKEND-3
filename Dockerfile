# Use Node base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files and install
COPY package*.json ./
RUN npm install

# Copy entire app
COPY . .

# Expose port
EXPOSE 5000

# Start app
CMD ["npm", "start"]
