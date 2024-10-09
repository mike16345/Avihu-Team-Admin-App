# Use an official Node.js runtime as a parent image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /frontend

# Copy package.json and package-lock.json to the working directory
COPY frontend/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application to the container
COPY frontend/ .

# Expose the port the app runs on (adjust if Vite uses a different port)
EXPOSE 3000

# Define the command to run your app
CMD ["npm", "start"]
