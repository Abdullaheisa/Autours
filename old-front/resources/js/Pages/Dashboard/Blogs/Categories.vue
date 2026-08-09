<template>
    <div class="container-fluid">
        <div class="page-header">
            <div>
                <h1 class="page-title">
                    <i class="fa fa-folder-open"></i> Blog Categories
                </h1>
                <p class="page-subtitle">Manage blog article categories</p>
            </div>
            <button @click="showAddForm = !showAddForm" class="btn btn-primary">
                <i class="fa fa-plus"></i> Add Category
            </button>
        </div>

        <!-- Add Form -->
        <div v-if="showAddForm" class="card add-form-card mb-4">
            <div class="card-body">
                <h5 class="mb-3">Create New Category</h5>
                <form @submit.prevent="addCategory">
                    <div class="row">
                        <div class="col-md-6">
                            <input v-model="newCategory.title" type="text" class="form-control" placeholder="Category title" required>
                        </div>
                        <div class="col-md-6">
                            <div class="d-flex gap-2">
                                <button type="submit" class="btn btn-success flex-grow-1">
                                    <i class="fa fa-save"></i> Add
                                </button>
                                <button @click="showAddForm = false" type="button" class="btn btn-secondary">
                                    <i class="fa fa-times"></i> Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary"></div>
        </div>

        <!-- Categories Table -->
        <div v-else class="card">
            <div class="table-responsive">
                <table class="table table-hover mb-0">
                    <thead class="table-dark">
                        <tr>
                            <th>Category Title</th>
                            <th class="text-center">Total Articles</th>
                            <th class="text-center">Active</th>
                            <th class="text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="categories.length === 0">
                            <td colspan="4" class="text-center py-4">
                                <i class="fa fa-inbox fa-2x text-muted mb-2"></i>
                                <p class="text-muted">No categories found</p>
                            </td>
                        </tr>
                        <tr v-for="category in categories" :key="category.id">
                            <td>
                                <strong>{{ category.title }}</strong>
                            </td>
                            <td class="text-center">
                                <span class="badge bg-info">{{ category.blogs?.length || 0 }}</span>
                            </td>
                            <td class="text-center">
                                <span v-if="category.activation" class="badge bg-success">
                                    <i class="fa fa-check"></i> Yes
                                </span>
                                <span v-else class="badge bg-warning">
                                    <i class="fa fa-times"></i> No
                                </span>
                            </td>
                            <td class="text-center">
                                <button @click="editingCategory = category; showEditForm = true" class="btn btn-sm btn-warning">
                                    <i class="fa fa-edit"></i>
                                </button>
                                <button @click="deleteCategory(category)" class="btn btn-sm btn-danger">
                                    <i class="fa fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Edit Modal -->
        <div v-if="showEditForm" class="modal-backdrop">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Edit Category</h5>
                        <button @click="showEditForm = false" class="btn-close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <label class="form-label">Category Title</label>
                            <input v-model="editingCategory.title" type="text" class="form-control">
                        </div>
                        <div class="form-check">
                            <input v-model="editingCategory.activation" type="checkbox" class="form-check-input" id="activationCheck">
                            <label class="form-check-label" for="activationCheck">
                                Active
                            </label>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button @click="showEditForm = false" class="btn btn-secondary">Cancel</button>
                        <button @click="updateCategory" class="btn btn-primary">Save Changes</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const categories = ref([])
const loading = ref(false)
const showAddForm = ref(false)
const showEditForm = ref(false)
const newCategory = ref({ title: '' })
const editingCategory = ref(null)

const fetchCategories = async () => {
    loading.value = true
    try {
        const res = await axios.get('/api/blog-categories')
        if (res.data.success) {
            categories.value = res.data.data
        }
    } catch (error) {
        console.error('Error fetching categories:', error)
    } finally {
        loading.value = false
    }
}

const addCategory = async () => {
    try {
        const res = await axios.post('/api/blog-categories', {
            title: newCategory.value.title,
            activation: true
        })
        if (res.data.success) {
            categories.value.push(res.data.data)
            newCategory.value = { title: '' }
            showAddForm.value = false
            alert('Category added successfully!')
        }
    } catch (error) {
        console.error('Error adding category:', error)
        alert('Error adding category')
    }
}

const updateCategory = async () => {
    try {
        const res = await axios.put(`/api/blog-categories/${editingCategory.value.id}`, {
            title: editingCategory.value.title,
            activation: editingCategory.value.activation
        })
        if (res.data.success) {
            const index = categories.value.findIndex(c => c.id === editingCategory.value.id)
            if (index > -1) {
                categories.value[index] = res.data.data
            }
            showEditForm.value = false
            alert('Category updated successfully!')
        }
    } catch (error) {
        console.error('Error updating category:', error)
        alert('Error updating category')
    }
}

const deleteCategory = async (category) => {
    if (!confirm(`Delete "${category.title}"?`)) return
    try {
        const res = await axios.delete(`/api/blog-categories/${category.id}`)
        if (res.data.success) {
            categories.value = categories.value.filter(c => c.id !== category.id)
            alert('Category deleted successfully!')
        }
    } catch (error) {
        console.error('Error deleting category:', error)
        alert('Error deleting category')
    }
}

onMounted(() => {
    fetchCategories()
})
</script>

<style scoped>
.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    padding: 20px 0;
    border-bottom: 2px solid #ffd100;
}

.page-title {
    font-size: 2rem;
    font-weight: 700;
    margin: 0;
    color: #333;
    display: flex;
    align-items: center;
    gap: 12px;
}

.page-title i {
    color: #0066cc;
    font-size: 2.2rem;
}

.page-subtitle {
    color: #666;
    margin: 5px 0 0 0;
    font-size: 0.95rem;
}

.btn {
    border-radius: 6px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 8px;
}

.btn-primary {
    background: #0066cc;
    border-color: #0066cc;
}

.btn-primary:hover {
    background: #0052a3;
}

.add-form-card {
    border: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    border-radius: 8px;
    background: #f9f9f9;
}

.card {
    border: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    border-radius: 8px;
}

.table {
    margin-bottom: 0;
}

.table thead th {
    background: #2c3e50;
    color: white;
    border: none;
    padding: 15px;
    font-weight: 600;
}

.table tbody td {
    padding: 15px;
    border-color: #e5e7eb;
    vertical-align: middle;
}

.table tbody tr:hover {
    background: #f9f9f9;
}

.badge {
    padding: 6px 12px;
    font-size: 0.85rem;
    font-weight: 600;
}

.modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1050;
}

.modal-dialog {
    background: white;
    border-radius: 8px;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
    max-width: 500px;
    width: 90%;
}

.modal-content {
    border: none;
}

.modal-header {
    border-bottom: 1px solid #e5e7eb;
    padding: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: #333;
    margin: 0;
}

.btn-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #666;
}

.modal-body {
    padding: 20px;
}

.modal-footer {
    border-top: 1px solid #e5e7eb;
    padding: 15px 20px;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}

.form-label {
    font-weight: 600;
    margin-bottom: 8px;
    color: #333;
}

.form-control {
    border-radius: 6px;
    padding: 10px 15px;
}

.form-control:focus {
    border-color: #0066cc;
    box-shadow: 0 0 0 0.2rem rgba(0, 102, 204, 0.25);
}

.d-flex {
    display: flex;
}

.gap-2 {
    gap: 10px;
}

.flex-grow-1 {
    flex: 1;
}
</style>

