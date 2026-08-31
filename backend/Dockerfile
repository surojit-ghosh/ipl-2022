FROM node:24.20.0-alpine3.24 AS build

WORKDIR /app
RUN corepack enable

COPY package.json pnpm-lock.yaml tsconfig.json ./
COPY src ./src
COPY prisma.config.ts ./
COPY prisma ./prisma

RUN pnpm install --frozen-lockfile
RUN pnpm db:generate
RUN pnpm build

FROM build AS migrate

FROM build AS production
RUN pnpm prune --prod

FROM node:24.20.0-alpine3.24

WORKDIR /app
RUN corepack enable

COPY --from=production /app/package.json ./
COPY --from=production /app/node_modules ./node_modules
COPY --from=production /app/dist ./dist

CMD ["pnpm", "start"]
