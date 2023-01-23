# syntax=docker/dockerfile:1.4

FROM node:lts-alpine

# Allow log level to be controlled. Uses an argument name that is different
# from the existing environment variable, otherwise the environment variable
# shadows the argument.
ARG LOGLEVEL
ENV NPM_CONFIG_LOGLEVEL ${LOGLEVEL}
RUN apk update && \
  apk add python make build-base && \
  rm -rf /var/cache/apk/*

# Copy jq script that can generate package.json files from package-lock.json
# files.
WORKDIR /wasp-api

# Install base dependencies
COPY . .
RUN npm ci --production


EXPOSE 3001
CMD ["node", "./app/index.js"]
