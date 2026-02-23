# Build Stage to fix sha
FROM node:24.13.1-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

# Production Stage to fix sha
FROM node:24.13.1-alpine AS production
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=build /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]