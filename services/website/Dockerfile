FROM node:14.15.1-slim

# Create new user
WORKDIR /usr/src/app

COPY package.json yarn.* /usr/src/app/
    
RUN yarn --pure-lockfile
