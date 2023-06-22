# ---- Base Node ----
FROM node:19-alpine AS base

RUN corepack prepare pnpm@latest --activate && corepack enable

WORKDIR /app
COPY package*.json ./
COPY pnpm-lock.yaml ./

# ---- Dependencies ----
FROM base AS dependencies
RUN pnpm install --frozen-lockfile

# ---- Build ----
FROM dependencies AS build
COPY . .
RUN pnpm build
RUN rm .env


# ---- Production ----
FROM node:19-alpine AS production
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package*.json ./
COPY --from=build /app/pnpm-lock.yaml ./
COPY --from=build /app/next.config.js ./next.config.js
COPY --from=build /app/next-i18next.config.js ./next-i18next.config.js

# Expose the port the app will run on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
