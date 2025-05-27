const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const cors = require('cors');
const typeDefsAndResolvers = require('./schema');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Allow CORS from any origin temporarily
app.use(cors());

// Connect to MongoDB and start the server
async function startServer() {
  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  const db = client.db('taskmanager');
  const tasksCollection = db.collection('tasks');

  const server = new ApolloServer({
    typeDefs: typeDefsAndResolvers.typeDefs,
    resolvers: typeDefsAndResolvers.resolvers(tasksCollection),
  });

  await server.start();
  server.applyMiddleware({ app });

  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer().catch((err) => {
  console.error('Error starting server:', err);
});
