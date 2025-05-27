const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type Task {
    id: ID!
    title: String!
    description: String
    status: String!
    dueDate: String
  }

  type Query {
    getAllTasks: [Task]
    getTaskById(id: ID!): Task
    getTasksByStatus(status: String!): [Task]
    getAllStatuses: [String]
  }

  type Mutation {
    addTask(title: String!, description: String, status: String!, dueDate: String): Task
    updateTaskStatus(id: ID!, status: String!): Task
  }
`;

const resolvers = (tasksCollection) => ({
  Query: {
    getAllTasks: async () => {
      return await tasksCollection.find().toArray();
    },
    getTaskById: async (_, { id }) => {
      const { ObjectId } = require('mongodb');
      return await tasksCollection.findOne({ _id: new ObjectId(id) });
    },
    getTasksByStatus: async (_, { status }) => {
      return await tasksCollection.find({ status }).toArray();
    },
    getAllStatuses: async () => {
        const tasks = await tasksCollection.find().toArray();
        const uniqueStatuses = [...new Set(tasks.map(task => task.status))];
        return uniqueStatuses;
    },
  },
  Mutation: {
    addTask: async (_, { title, description, status, dueDate }) => {
      const newTask = { title, description, status, dueDate };
      const result = await tasksCollection.insertOne(newTask);
      return { id: result.insertedId, ...newTask };
    },
    updateTaskStatus: async (_, { id, status }) => {
      const { ObjectId } = require('mongodb');
      await tasksCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { status } }
      );
      return await tasksCollection.findOne({ _id: new ObjectId(id) });
    },
  },
  // Converts _id to id 
  Task: {
    id: (task) => task._id.toString(),
  },
});

module.exports = { typeDefs, resolvers };

