# Stage 1: Build
FROM node:18-slim AS build

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and yarn.lock to the working directory
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy the rest of the application files
COPY . .

# Build the application
RUN yarn build

# Stage 2: Run
FROM node:18-slim AS runtime

# Set the working directory inside the container
WORKDIR /app

# Copy the necessary files from the build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/yarn.lock ./yarn.lock

# Install production dependencies and Vite
RUN yarn install --frozen-lockfile --production && yarn add vite --frozen-lockfile

# Expose the port your app will run on
EXPOSE 3004

# Start the application using Vite's preview server
CMD ["yarn", "preview", "--host", "0.0.0.0"]