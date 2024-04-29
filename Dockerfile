FROM node:16.16.0-alpine3.16

WORKDIR /app

# Install NGINX and necessary tools
RUN apk update && apk add --no-cache nginx curl bash

# Download wait-for-it
RUN curl -sSL https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh > /usr/local/bin/wait-for-it.sh \
    && chmod +x /usr/local/bin/wait-for-it.sh

# Copy NGINX configuration
COPY nginx.conf /etc/nginx/http.d/default.conf

# Install dependencies for Eleventy and Express
COPY package*.json ./
RUN npm install

ENV ELEVENTY_ENV=development
ENV API_URL=http://docker.com/api

# Build Eleventy site
COPY . .
RUN npx eleventy

# Copy Express server file
COPY server.js .

# Expose ports for Eleventy and Express
EXPOSE 80 3000

# Start NGINX and Express server
CMD nginx && node server.js