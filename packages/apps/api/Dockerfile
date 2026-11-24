FROM node:24-slim

RUN npm install -g pnpm@10

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/shared/contracts/package.json packages/shared/contracts/
COPY packages/shared/ui/package.json packages/shared/ui/
COPY packages/apps/api/package.json packages/apps/api/
COPY packages/apps/web/package.json packages/apps/web/

RUN pnpm install --frozen-lockfile --filter @sentinel/api...

COPY packages/shared/contracts packages/shared/contracts
COPY packages/apps/api packages/apps/api

WORKDIR /app/packages/apps/api

RUN groupadd -g 10001 app && useradd -u 10001 -g app -m app \
    && chown -R 10001:10001 /app/packages/apps/api /home/app
USER 10001:10001

EXPOSE 8080

CMD ["node_modules/.bin/vite-node", "src/server.ts"]
