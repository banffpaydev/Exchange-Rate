# Use an official Node.js runtime as a parent image
FROM node:18-slim AS build

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and yarn.lock to the working directory
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy the rest of the application to the working directory
COPY . .

# Build the application
RUN yarn build

# Expose the application's port
EXPOSE 3002

# Start the application using the script in package.json
CMD ["yarn", "run", "build"]
