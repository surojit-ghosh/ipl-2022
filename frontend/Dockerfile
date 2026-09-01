FROM node:24.20.0-alpine3.24 AS build

WORKDIR /app
RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

ARG CACHE_BUST
RUN pnpm build
RUN pnpm prune --prod

FROM node:24.20.0-alpine3.24

WORKDIR /app
RUN corepack enable

COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next

CMD ["pnpm", "start"]
