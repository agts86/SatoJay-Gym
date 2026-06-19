FROM node:24-alpine AS base
WORKDIR /app
RUN corepack enable

FROM base AS deps
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile=false

FROM deps AS dev
COPY . .
EXPOSE 3000
CMD ["pnpm", "dev"]

FROM deps AS build
COPY . .
RUN DATABASE_URL="postgresql://postgres:postgres@localhost:5432/satojay_gym?schema=public" \
    DATABASE_URL_UNPOOLED="postgresql://postgres:postgres@localhost:5432/satojay_gym?schema=public" \
    ADMIN_PASSWORD_HASH="dummy-build-time-value" \
    ADMIN_SESSION_SECRET="dummy-build-time-value" \
    pnpm build

FROM base AS runner
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=80
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/prisma ./prisma
EXPOSE 80
CMD ["pnpm", "start"]
