FROM node:22.23.1-alpine@sha256:16e22a550f3863206a3f701448c45f7912c6896a62de43add43bb9c86130c3e2 AS build
WORKDIR /workspace
RUN corepack enable
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json ./
COPY apps/preview/package.json apps/preview/package.json
RUN pnpm install --frozen-lockfile
COPY apps/preview apps/preview
RUN pnpm --filter @domus/preview build

FROM node:22.23.1-alpine@sha256:16e22a550f3863206a3f701448c45f7912c6896a62de43add43bb9c86130c3e2 AS runtime
WORKDIR /app
ENV HOST=0.0.0.0 PORT=4322 NODE_ENV=production
COPY --from=build /workspace/apps/preview/dist ./dist
USER node
EXPOSE 4322
CMD ["node", "dist/server.js"]
