FROM node:22.13.0-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Génère le client Prisma avant le build TypeScript
RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/src/main"]