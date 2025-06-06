FROM node:22-alpine

WORKDIR /app

COPY . .
RUN npm ci
RUN npx prisma generate
RUN npm run build

RUN adduser -D -g '' api && chown -R api /app
USER api

EXPOSE 8080

CMD ["npm", "run", "start"]

