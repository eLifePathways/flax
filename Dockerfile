# Use the official Node.js 14 image as the base image
FROM node:14

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json files to the working directory
COPY package*.json ./

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Install project dependencies
RUN npm install

# Copy the entire project directory to the working directory
COPY . .

# Build the Eleventy site
RUN npx eleventy

# Expose the container port that will be used to serve the site
EXPOSE 8080

# Define the command to start the server when the container is run
CMD ["npx", "eleventy", "--serve"]