<script setup>
import { defineProps, computed } from "vue";
import { useTodoStore } from "@/stores/useTodoStore";

const props = defineProps({ filterType: String });

const todoStore = useTodoStore();

const filteredTodos = computed(() => {
  return todoStore.todos.length ? todoStore.todos.filter(todo => {
    if (props.filterType === "pending") return !todo.completed && !todo.deleted
    if (props.filterType === "completed") return todo.completed && !todo.deleted
    if (props.filterType === "deleted") return todo.deleted
    return false
  }) : []
})


const toggleComplete = id => todoStore.toggleComplete(id);
const deleteTodo = id => todoStore.deleteTodo(id);
const restoreTodo = id => todoStore.restoreTodo(id);
const startEditing = (id) => {
    const todoIndex = todoStore.todos.findIndex(todo => todo.id === id);
    if (todoIndex !== -1) {
        // ✅ Create a new array to avoid modifying the frozen object
        todoStore.todos = todoStore.todos.map((todo, index) =>
            index === todoIndex ? { ...todo, isEditing: true } : todo
        );
    }
};

const saveEdit = (id, title) => todoStore.editTodo(id, title);
</script>

<template>
    <slot :todos="filteredTodos" :toggleComplete="toggleComplete"
          :deleteTodo="deleteTodo" :restoreTodo="restoreTodo"
          :startEditing="startEditing" :saveEdit="saveEdit">
    </slot>
</template>
