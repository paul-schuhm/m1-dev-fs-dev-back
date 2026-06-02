# Source : https://docs.docker.com/guides/nodejs/containerize/

# ================================================
# Base Image (basé sur les Docker Hardened Images)
# ================================================
FROM dhi.io/node:24-alpine3.22-dev AS base
WORKDIR /app
# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs && \
    chown -R nodejs:nodejs /app

# ================================================
# Build Dependencies Stage (installes deps de dev)
# ================================================
FROM base AS build-deps

# Copy package files
COPY package*.json eslint.config.*s esbuild.config.*s ./

# Install all dependencies with build optimizations
# Crée un espace de stockage persistant (un cache) partagé entre tes différentes sessions de build Docker
RUN --mount=type=cache,target=/root/.npm,sharing=locked \
    npm ci --no-audit --no-fund && \
    npm cache clean --force

# Set proper ownership
RUN chown -R nodejs:nodejs /app

# ================================================
# Dependencies Stage (installe les deps de prod)
# ================================================

FROM base AS deps
# Copy package files
COPY package*.json ./

# Install production dependencies
RUN --mount=type=cache,target=/root/.npm,sharing=locked \
     npm ci --omit=dev --ignore-scripts && \
     npm cache clean --force

# Set proper ownership
RUN chown -R nodejs:nodejs /app

# ================================================
# Build Stage (concatène en un script avec esbuild)
# ================================================
FROM build-deps AS build

# Copy only necessary files for building (respects .dockerignore)
COPY --chown=nodejs:nodejs . .

# Build the application
RUN npm run build

# Set proper ownership
RUN chown -R nodejs:nodejs /app

# ================================================
# Development Stage (application env de dev)
# ================================================
FROM build-deps AS development

# Set environment
ENV NODE_ENV=development \
    NPM_CONFIG_LOGLEVEL=warn

# Build openapi spec
COPY build-openapi-spec.js .
RUN npm run gen-oad
COPY oad.json .

# Copy source files
COPY src/ ./src
COPY tests/ ./tests/

USER root

# Expose ports
EXPOSE 3000 9229

# Start development server
CMD ["npm", "run", "dev"]

# ================================================
# Production Stage (application env de prod)
# ================================================
FROM dhi.io/node:24-alpine3.22-dev AS production

# Set working directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs && \
    chown -R nodejs:nodejs /app

# Set optimized environment variables
ENV NODE_ENV=production \
    NODE_OPTIONS="--max-old-space-size=256 --no-warnings" \
    NPM_CONFIG_LOGLEVEL=silent

# Copy production dependencies from deps stage
COPY --from=deps --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=deps --chown=nodejs:nodejs /app/package*.json ./
# Copy built application from build stage
COPY --from=build --chown=nodejs:nodejs /app/dist ./dist

# Switch to non-root user for security
USER nodejs

# Expose port
EXPOSE 3000

# Start production server
CMD ["node", "dist/server.js"]


# ================================================
# Test Stage (execute la suite de tests "internes")
# ================================================
FROM build-deps AS test

# Set environment
ENV NODE_ENV=test \
    CI=true

# Copy source files
COPY src/ ./src
COPY tests/ ./tests/
COPY eslint.config.js .

# Ensure all directories have proper permissions
RUN chown -R nodejs:nodejs /app && \
    chmod -R 755 /app

# Switch to non-root user
USER nodejs

# Run tests with coverage
CMD ["npm", "run", "test"]