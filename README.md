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

## Running migration

Download the SQL Auth Proxy and run the proxy:

```sh
wget https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.16.0/cloud-sql-proxy.linux.amd64 -O cloud_sql_proxy
chmod +x cloud_sql_proxy
./cloud_sql_proxy $INSTANCE -c ./credentials.json
```

Run the migration using the address `127.0.0.1:5432` with the SQL User created at GCP SQL.
