<script setup>
import { ref, onMounted } from "vue";
import { useTodoStore } from "../stores/useTodoStore";
import TodoRenderless from "./TodoRenderless.vue";

const todoStore = useTodoStore();
const activeTab = ref("pending");
const newTask = ref(""); // Track the new task input

const addTask = () => {
    if (newTask.value.trim()) {
        todoStore.addTodo(newTask.value); // Call Pinia action to add the task
        newTask.value = ""; // Clear input field after adding
    }
};
onMounted(() => {
    todoStore.loadTodos("pending") // ✅ Auto-load Pending Todos on Startup
})
</script>

<template>
    <div class="container">
        <div class="todo-form">
            <form @submit.prevent="addTask">
                <input v-model="newTask" type="text" placeholder="Add new Task">
                <button type="submit">+</button>
            </form>
        </div>

        <div class="tabs">
            <button @click="activeTab = 'pending'; todoStore.loadTodos('pending')">
                Pending
            </button>
            <button @click="activeTab = 'completed'; todoStore.loadTodos('completed')">
                Completed
            </button>
            <button @click="activeTab = 'deleted'; todoStore.loadTodos('deleted')">
                Deleted
            </button>
        </div>

        <!-- ✅ Loading Indicator -->
        <div v-if="todoStore.isLoading" class="loading">
            <p>Loading tasks... ⏳</p>
        </div>

        <!-- ✅ Show table only when NOT loading -->
        <TodoRenderless v-if="!todoStore.isLoading" :filterType="activeTab"
            v-slot="{ todos, toggleComplete, deleteTodo, restoreTodo, startEditing, saveEdit }">
            <div class="todo-table">
                <h1>{{ activeTab.charAt(0).toUpperCase() + activeTab.slice(1) }} Todos</h1>

                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Todo title</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="todo in todos" :key="todo.id">
                            <td><input type="checkbox" :checked="todo.completed" @change="toggleComplete(todo.id)"></td>
                            <td>
                                <input v-if="todo.isEditing" v-model="todo.title" @blur="saveEdit(todo.id, todo.title)"
                                    @keyup.enter="saveEdit(todo.id, todo.title)" class="edit-input" />
                                <span v-else @dblclick="startEditing(todo.id)">{{ todo.title }}</span>
                            </td>
                            <td>{{ activeTab.charAt(0).toUpperCase() + activeTab.slice(1) }}</td>
                            <td>
                                <button v-if="todo.isEditing" @click="saveEdit(todo.id, todo.title)" class="save-btn">💾
                                    Save</button>
                                <button v-else @click="startEditing(todo.id)">✏ Edit</button>
                                <button v-if="activeTab !== 'deleted'" @click="deleteTodo(todo.id)"
                                    class="delete-btn">Delete</button>
                                <button v-if="activeTab === 'deleted'" @click="restoreTodo(todo.id)"
                                    class="restore-btn">🔄 Restore</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </TodoRenderless>
    </div>
</template>



<style scoped>
.edit-input {
    border: 1px solid #ccc;
    padding: 5px;
    width: 100%;
    font-size: 16px;
}

.save-btn {
    background-color: #007bff;
    color: white;
    border: none;
    padding: 5px 10px;
    cursor: pointer;
    border-radius: 5px;
    margin-right: 5px;
}

.tabs {
    display: flex;
    gap: 1px;
    margin-top: 2em;
}

.tabs button {
    background: lightgray;
    border: none;
    padding: 10px 20px;
    cursor: pointer;
}

.tabs button:first-child {
    border-radius: 10px 0px 0px 0px;
}

/* ✅ Style for Loading Indicator */
.loading {
    text-align: center;
    font-size: 1.2em;
    padding: 10px;
    color: #007bff;
}

.tabs button:last-child {
    border-radius: 0px 5px 0px 0px;
}

.tabs button.active {
    background: #3d39aa;
    color: white;
}

.delete-btn {
    background-color: red;
    color: white;
    border: none;
    padding: 5px 10px;
    cursor: pointer;
    margin-left: 2px;
    border-radius: 5px;
}

.restore-btn {
    background-color: green;
    color: white;
    border: none;
    padding: 5px 10px;
    cursor: pointer;
    border-radius: 5px;
}
</style>