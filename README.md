## Playola

This is the monorepo for the Playola server, website, and serverless services.

## Environments

| Environment | Branch      | URL                   | CI                                                                                                                                                                                                  | Documentation                           |
| ----------- | ----------- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| Development | develop | https://dev.playola.fm <br> https://api-dev.playola.fm | [![CircleCI](https://circleci.com/gh/briankeane/playola/tree/develop.svg?style=svg&circle-token=40fbd221b5d981ce8218de1a872bb54671ebb68c)](https://circleci.com/gh/briankeane/playola/tree/develop) | [Docs](https://api-dev.playola.fm/docs) |
| Production  | master      | https://playola.fm <br> https://api.playola.fm  | [![CircleCI](https://circleci.com/gh/briankeane/playola/tree/master.svg?style=svg&circle-token=40fbd221b5d981ce8218de1a872bb54671ebb68c)](https://circleci.com/gh/briankeane/playola/tree/master)   | [Docs](https://playola.fm/docs)         |

## Getting Started

1. Install [Docker](https://www.docker.com/get-started).

2. Create a file at `services/server/.env` and copy the contents of [/services/server/.env-example](/services/server/.env-example) into it
3. from the project's root folder, type:

`docker-compose up --build`

## Development

After the containers have been built, you can start the servers with:

```
docker-compose up
```

Ports:

- server: 10020
- website: 10060

## Overview

- [server](/services/server)
- [website](/services/website)

##### Requests

```http
GET /v1/spotify/auth
```
