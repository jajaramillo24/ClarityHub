FROM node:22-alpine AS build
WORKDIR /app
# Prisma's engines need libssl even on Alpine/musl.
RUN apk add --no-cache openssl
COPY package*.json ./
# Needed before `npm install` so its postinstall (`prisma generate`) has a
# schema to read — schema.prisma isn't part of package*.json.
COPY prisma ./prisma
COPY prisma7.config.ts ./
RUN npm install
COPY . .
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
RUN apk add --no-cache openssl
ENV NODE_ENV=production
# Copied wholesale from the build stage instead of a second `npm install
# --omit=dev`: that would skip the `prisma` CLI (a devDependency) and its
# postinstall `prisma generate` would fail with the CLI missing. This also
# guarantees the exact generated client that was built and tested ships to
# runtime, not a freshly regenerated one.
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma7.config.ts ./
EXPOSE 3003
# `db push` syncs the schema on every boot since there's no migrations
# folder (see prisma7.config.ts) — a no-op once the DB already matches.
CMD ["sh", "-c", "npx prisma db push && node dist/main.js"]
