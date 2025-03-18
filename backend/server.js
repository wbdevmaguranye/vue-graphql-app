import 'dotenv/config'
import express from 'express'
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import { gql } from 'graphql-tag'
import cors from 'cors'
import mongoose from 'mongoose'

// ✅ Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/todos'

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((error) => {
    console.error('❌ MongoDB Connection Error:', error)
    process.exit(1)
  })

const Todo = mongoose.model('Todo', {
  title: String,
  completed: Boolean,
  isEditing: { type: Boolean, default: false },
  deleted: { type: Boolean, default: false },
})

const typeDefs = gql`
  type Todo {
    id: ID!
    title: String!
    completed: Boolean!
    isEditing: Boolean!
    deleted: Boolean!
  }

  type Query {
    todos: [Todo]
  }

  type Mutation {
    addTodo(title: String!): Todo
    toggleTodo(id: ID!): Todo
    deleteTodo(id: ID!): Todo
    restoreTodo(id: ID!): Todo
    editTodo(id: ID!, title: String!): Todo
  }
`

const resolvers = {
  Query: {
    todos: async () => {
      try {
        const todos = await Todo.find() // ✅ Fetch all todos

        return todos
      } catch (error) {
        console.error('Error fetching todos:', error)
        throw new Error('Failed to fetch todos')
      }
    },
  },
  Mutation: {
    addTodo: async (_, { title }) => {
      const todo = new Todo({ title, completed: false, isEditing: false, deleted: false })
      await todo.save()
      return todo
    },
    toggleTodo: async (_, { id }) => {
      const todo = await Todo.findById(id)
      if (!todo) throw new Error('Todo not found')

      todo.completed = !todo.completed
      await todo.save()

      return { id: todo.id, completed: todo.completed } // ✅ Return updated values
    },
    editTodo: async (_, { id, title }) => {
      const todo = await Todo.findById(id)
      if (!todo) throw new Error('Todo not found')

      todo.title = title
      todo.isEditing = false // ✅ Ensure edit mode is exited after saving
      await todo.save()

      return { id: todo.id, title: todo.title, isEditing: todo.isEditing }
    },

    deleteTodo: async (_, { id }) => {
      try {
        const todo = await Todo.findById(id)
        if (!todo) throw new Error('Todo not found')

        todo.deleted = true // ✅ Soft delete instead of permanent removal
        await todo.save()

        return { id: todo.id } // ✅ Ensure ID is returned for the frontend
      } catch (error) {
        console.error('Error deleting todo:', error)
        throw new Error('Failed to delete todo')
      }
    },

    restoreTodo: async (_, { id }) => {
      try {
        const todo = await Todo.findById(id)
        if (!todo) throw new Error('Todo not found')

        todo.deleted = false // ✅ Change deleted flag to false
        await todo.save()

        return { id: todo.id, deleted: todo.deleted } // ✅ Ensure data matches frontend expectations
      } catch (error) {
        console.error('Error restoring todo:', error)
        throw new Error('Failed to restore todo')
      }
    },
  },
}

const app = express()
app.use(cors())
app.use(express.json()) // ✅ Add this to enable JSON parsing

const server = new ApolloServer({ typeDefs, resolvers })

server.start().then(() => {
  app.use('/graphql', expressMiddleware(server)) // ✅ Middleware after express.json()
  app.listen(4000, () => console.log('🚀 GraphQL Server running at http://localhost:4000/graphql'))
})
