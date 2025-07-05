# Use the official Node.js 18 image
FROM node:18

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the entire app source code
COPY . .

# Expose the port your app runs on (e.g., 5000 or from env)
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
