'use strict';

const app = require('express')();
const bearerToken = require('express-bearer-token');
const bodyParser = require('body-parser');
const errorHandler = require('errorhandler');

const morgan = require('morgan');
const compression = require('compression');
const port = process.env.PORT || 5000;
const { sequelize } = require('./db');
const logger = require('./lib/logger');
const http = require('http');
const { ApolloServer } = require('apollo-server-express');
const typeDefs = require('./graphql/schema.js');
const resolvers = require('./graphql/resolvers.js');
const addRoutes = require('./routes.js');
const eventHandlers = require('./lib/eventHandlers.js');
const eventStream = require('./lib/eventStream');

app.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header(
    'Access-Control-Allow-Headers',
    'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Authorization'
  );
  if ('OPTIONS' === req.method) {
    res.status(200).end();
  } else {
    next();
  }
});

app.use(bearerToken());
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(morgan('dev'));

function connectToEventStreamWithRetry() {
  return new Promise((resolve, reject) => {
    eventStream
      .connect()
      .then(() => {
        eventHandlers.subscribeAll();

        // set max prefetch to avoid overloading heroku memory
        for (let stream of eventStream.streams) {
          stream.channel.prefetch(100);
        }
        resolve();
      })
      .catch((err) => {
        logger.log('Error connecting to eventStream.  Retrying after 1 sec');
        logger.log(err);
        setTimeout(connectToEventStreamWithRetry, 1000);
      });
  });
}

Promise.all([sequelize.sync(), connectToEventStreamWithRetry()])
  .then(() => {
    app.isReady = true;
    app.emit('READY');
  })
  .catch((err) => logger.error(err));

const server = http.createServer(app);
addRoutes(app);

if (process.env.environment !== 'production') {
  app.use(errorHandler({ log: (err, str, req) => logger.error(err) }));
}
const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
});
apolloServer.applyMiddleware({ app });
apolloServer.installSubscriptionHandlers(server);

server.listen(port, function () {
  logger.log(`Listening on port: ${port}`);
  logger.log(
    `🚀 GraphQL Server ready at http://localhost:${port}${apolloServer.graphqlPath}`
  );
  logger.log(
    `🚀 GraphQL Subscriptions ready at ws://localhost:${port}${apolloServer.subscriptionsPath}`
  );
});

// explicitly log stack trace for unhandled rejections
process.on('unhandledRejection', (err, p) => {
  logger.always.log(err);
});

exports = module.exports = app;
