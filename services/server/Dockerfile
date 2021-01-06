FROM node:14.15.1-slim

# Create new user
WORKDIR /usr/src/app

COPY package.json yarn.* /usr/src/app/

RUN apt-get update && apt install -y netcat

# env-cmd and sequelize at the command-line for
# easier development
RUN yarn global add env-cmd sequelize-cli
    
RUN yarn install
