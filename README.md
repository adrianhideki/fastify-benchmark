# Fastify API

An API to test the fastify performance with zod, prisma and postgresql.

## Setup

Install the dependencies:

```sh
npm i
```

Create a postgres database using docker:

```sh
cd docker/
docker compose up -d
```

Configure the correspondent [environment variables](#environment-variables).

Run the prisma generator and push:

```sh
npx prisma generate
npx prisma push
```

## Environment Variables

```
DATABASE_URL="postgresql://USER:PASS@SERVER:PORT/blog?schema=public"
```
