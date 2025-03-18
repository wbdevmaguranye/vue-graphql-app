import { gql } from '@apollo/client/core'

// ✅ Define GraphQL Queries & Mutations
export const GET_TODOS = gql`
  query GetTodos {
    todos {
      id
      title
      completed
      deleted
    }
  }
`

export const ADD_TODO = gql`
  mutation ($title: String!) {
    addTodo(title: $title) {
      id
      title
      completed
    }
  }
`

export const TOGGLE_TODO = gql`
  mutation ($id: ID!) {
    toggleTodo(id: $id) {
      id
      completed
    }
  }
`

export const DELETE_TODO = gql`
  mutation DeleteTodo($id: ID!) {
    deleteTodo(id: $id) {
      id
    }
  }
`
export const RESTORE_TODO = gql`
  mutation RestoreTodo($id: ID!) {
    restoreTodo(id: $id) {
      id
      deleted
    }
  }
`
export const EDIT_TODO = gql`
  mutation EditTodo($id: ID!, $title: String!) {
    editTodo(id: $id, title: $title) {
      id
      title
      isEditing
    }
  }
`
