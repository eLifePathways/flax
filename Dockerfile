# Use an official Node.js image as the base
FROM node:16.16.0-alpine3.16

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the entire project to the container
COPY . .

# Build the Eleventy site
RUN npx @11ty/eleventy

# Expose the port that Eleventy uses (default is 8080)
EXPOSE 8080

# # Set the command to run when the container starts
# CMD ["node", "public/server.js"]

# CMD ["npm", "start"]