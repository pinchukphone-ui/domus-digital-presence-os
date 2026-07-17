FROM node:22-alpine AS build
WORKDIR /workspace
RUN corepack enable
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* tsconfig.base.json ./
COPY apps/public-web/package.json apps/public-web/package.json
COPY packages/api-client/package.json packages/api-client/package.json
COPY packages/content-model/package.json packages/content-model/package.json
COPY packages/design-system/package.json packages/design-system/package.json
COPY packages/seo/package.json packages/seo/package.json
RUN pnpm install --frozen-lockfile=false
COPY apps/public-web apps/public-web
COPY packages/api-client packages/api-client
COPY packages/content-model packages/content-model
COPY packages/design-system packages/design-system
COPY packages/seo packages/seo
RUN CONTENT_SOURCE=fixture pnpm --filter @domus/public-web build

FROM node:22-alpine AS runtime
WORKDIR /workspace
ENV HOST=0.0.0.0 PORT=4321 NODE_ENV=production
COPY --from=build /workspace/node_modules ./node_modules
COPY --from=build /workspace/apps/public-web/node_modules ./apps/public-web/node_modules
COPY --from=build /workspace/apps/public-web/package.json ./apps/public-web/package.json
COPY --from=build /workspace/apps/public-web/dist ./apps/public-web/dist
WORKDIR /workspace/apps/public-web
USER node
EXPOSE 4321
CMD ["node", "dist/server/entry.mjs"]
