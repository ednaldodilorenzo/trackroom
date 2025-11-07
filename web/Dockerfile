FROM node:25.0-slim AS development

WORKDIR /app

# dependências básicas
RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates \
    git \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --legacy-peer-deps

CMD ["npx", "vite", "--host", "0.0.0.0"]


FROM node:25-alpine3.22 AS build-env

WORKDIR /app

RUN apk add --no-cache \
    curl \
    git \
    python3 \
    make \
    g++ 

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .
RUN npm run build


FROM nginx:alpine AS release

COPY --from=build-env /app/dist/ /usr/share/nginx/html/
COPY ./bioaccess.crt ./bioaccess.key /etc/nginx/ssl/
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
