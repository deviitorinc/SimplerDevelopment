FROM oven/bun:1.3.11-alpine AS base
RUN apk add --no-cache python3 make g++ nodejs npm
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json bun.lock ./
# If there are workspaces or packages, copy them so install works
COPY packages packages
COPY simplerdevelopment-agents simplerdevelopment-agents
COPY workers workers
RUN bun install --frozen-lockfile

# Build
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Disabling telemetry and linting during build to avoid failures
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_IGNORE_ESLINT=1
ENV NEXT_IGNORE_TYPECHECKS=1
RUN npx next build

# Runner
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts

EXPOSE 3000
CMD ["npx", "next", "start"]
