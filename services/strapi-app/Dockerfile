# © 2026 Forsati. All rights reserved.
# Strapi App Dockerfile for Forsati Platform

FROM node:20-alpine

# Install dependencies
RUN apk add --no-cache build-base gcc autoconf automake zlib-dev libpng-dev vips-dev git

# Set working directory
WORKDIR /srv/app

# Create strapi user
RUN addgroup -g 1001 -S strapi && \
    adduser -S strapi -u 1001 -G strapi

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy app source
COPY . .

# Fix permissions
RUN chown -R strapi:strapi /srv/app

# Switch to non-root user
USER strapi

# Expose port
EXPOSE 1337

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget -q --spider http://localhost:1337/_health || exit 1

# Start Strapi
CMD ["npm", "run", "develop"]
