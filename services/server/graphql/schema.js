const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type Song {
    id: String!
    title: String!
  }

  type Query {
    songs: [Song!]
  }

  type Subscription {
    songUpdated(songId: String!): Song
  }
`;

module.exports = typeDefs;
