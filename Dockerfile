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

# Use Nginx as a web server for serving the built files
FROM nginx:stable-alpine

# Copy the built files from the previous stage to the Nginx HTML directory
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 for the Nginx server
EXPOSE 80

# Start Nginx when the container launches
CMD ["nginx", "-g", "daemon off;"]
