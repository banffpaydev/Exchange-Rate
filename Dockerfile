# Stage 1: Build
FROM node:18 AS builder

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and yarn.lock files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --production=false

# Copy the rest of the application files
COPY . .

# Compile TypeScript to JavaScript
RUN yarn build

# Stage 2: Run
FROM node:18-alpine AS runner

# Set the working directory in the container
WORKDIR /app

# Copy only the production dependencies
COPY package.json yarn.lock ./
RUN yarn install --production

# Copy the compiled files from the build stage
COPY --from=builder /app/dist ./dist

# Expose the port your app runs on
EXPOSE 3002

# Command to run the application
CMD ["node", "dist/server.js"]
