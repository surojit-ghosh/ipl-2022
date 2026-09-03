FROM node:24.20.0-alpine3.24 AS build

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY tsconfig.json prisma.config.ts ./
COPY prisma ./prisma
COPY src ./src

RUN pnpm db:generate

RUN pnpm build

FROM build AS migrate

FROM build AS prune

RUN pnpm prune --prod

FROM node:24.20.0-alpine3.24 AS production

WORKDIR /app

ENV NODE_ENV=production

RUN corepack enable

COPY --from=prune /app/package.json ./
COPY --from=prune /app/node_modules ./node_modules
COPY --from=prune /app/dist ./dist

EXPOSE 3001

CMD ["pnpm", "start"]