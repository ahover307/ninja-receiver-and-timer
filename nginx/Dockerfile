# Build stage
FROM node:14 as build-stage
WORKDIR /app
COPY ../frontend/package.json ./
COPY ../frontend/yarn.lock ./
RUN yarn install
COPY . .
RUN yarn build

# Production stage
FROM nginx:alpine
COPY --from=build-stage /app/build /usr/share/nginx/html
EXPOSE 80
EXPOSE 443
