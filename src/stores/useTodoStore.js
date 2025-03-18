import { defineStore } from 'pinia'
import apolloClient from '../services/apolloClient'
import {
  GET_TODOS,
  ADD_TODO,
  TOGGLE_TODO,
  DELETE_TODO,
  RESTORE_TODO,
  EDIT_TODO,
} from '../services/graphqlQueries'

export const useTodoStore = defineStore('todoStore', {
  state: () => ({
    todos: [],
    isLoading: false, // ✅ New loading state
  }),

  actions: {
    async loadTodos(filter = 'pending') {
      this.isLoading = true // ✅ Show loading state

      try {
        const cachedTodos = localStorage.getItem('cachedTodos')
        if (cachedTodos) {
          this.todos = JSON.parse(cachedTodos) // ✅ Use cache first
        }

        const { data } = await apolloClient.query({ query: GET_TODOS })
        this.todos = data.todos || []
        localStorage.setItem('cachedTodos', JSON.stringify(this.todos)) // ✅ Cache for next load
      } catch (error) {
        console.error('Error loading todos:', error)
        this.todos = []
      } finally {
        this.isLoading = false // ✅ Hide loading state
      }
    },

    async addTodo(title) {
      try {
        const { data } = await apolloClient.mutate({
          mutation: ADD_TODO,
          variables: { title },
        })
        this.todos.push(data.addTodo)
      } catch (error) {
        console.error('Error adding todo:', error)
      }
    },

    async toggleComplete(id) {
      try {
        const { data } = await apolloClient.mutate({
          mutation: TOGGLE_TODO,
          variables: { id },
        })

        // ✅ Create a new array with the updated todo (avoids modifying the frozen object)
        this.todos = this.todos.map((todo) =>
          todo.id === id ? { ...todo, completed: data.toggleTodo.completed } : todo,
        )
      } catch (error) {
        console.error('Error toggling todo:', error)
      }
    },
    async deleteTodo(id) {
      try {
        const { data } = await apolloClient.mutate({
          mutation: DELETE_TODO,
          variables: { id },
        })

        // ✅ Remove the todo from local state
        this.todos = this.todos.filter((todo) => todo.id !== id)
      } catch (error) {
        console.error('Error deleting todo:', error)
      }
    },
    async restoreTodo(id) {
      try {
        const { data } = await apolloClient.mutate({
          mutation: RESTORE_TODO, // ✅ Ensure RESTORE_TODO exists in graphqlQueries.js
          variables: { id },
        })

        // ✅ Update local state
        this.todos = this.todos.map((todo) => (todo.id === id ? { ...todo, deleted: false } : todo))
      } catch (error) {
        console.error('Error restoring todo:', error)
      }
    },
    async editTodo(id, title) {
      try {
        const { data } = await apolloClient.mutate({
          mutation: EDIT_TODO, // ✅ Ensure this exists in `graphqlQueries.js`
          variables: { id, title },
        })

        // ✅ Update state with a new array (avoids modifying frozen objects)
        this.todos = this.todos.map((todo) =>
          todo.id === id ? { ...todo, title: data.editTodo.title, isEditing: false } : todo,
        )
      } catch (error) {
        console.error('Error editing todo:', error)
      }
    },
  },
})
