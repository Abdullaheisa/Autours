<template>
    <div class="container">
        <div class="page-header">
            <div>
                <h1 class="page-title">
                    <i class="fa fa-newspaper-o"></i> Blog Management
                </h1>
                <p class="page-subtitle">Manage all your blog articles and categories</p>
            </div>
            <Link href="/admin/blogs/create" class="btn btn-primary btn-lg">
                <i class="fa fa-plus"></i> Add New Article
            </Link>
        </div>

        <!-- Filters Section -->
        <div class="card filters-card mb-4">
            <div class="card-body">
                <div class="row g-3">
                    <div class="col-lg-4">
                        <div class="input-group">
                            <span class="input-group-text"><i class="fa fa-search"></i></span>
                            <input
                                v-model="searchQuery"
                                type="text"
                                class="form-control"
                                placeholder="Search by title or author...">
                        </div>
                    </div>
                    <div class="col-lg-3">
                        <select v-model="filterCategory" class="form-control">
                            <option value="">All Categories</option>
                            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                                {{ cat.title }}
                            </option>
                        </select>
                    </div>
                    <div class="col-lg-3">
                        <select v-model="filterStatus" class="form-control">
                            <option value="">All Status</option>
                            <option value="published">Published</option>
                            <option value="draft">Draft</option>
                        </select>
                    </div>
                    <div class="col-lg-2">
                        <button @click="clearFilters" class="btn btn-outline-secondary w-100">
                            <i class="fa fa-redo"></i> Clear
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Stats Cards -->
        <div class="row mb-4">
            <div class="col-md-3">
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fa fa-file-text-o"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-number">{{ totalBlogs }}</div>
                        <div class="stat-label">Total Articles</div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card">
                    <div class="stat-icon published">
                        <i class="fa fa-check-circle"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-number">{{ publishedCount }}</div>
                        <div class="stat-label">Published</div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card">
                    <div class="stat-icon draft">
                        <i class="fa fa-clock-o"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-number">{{ draftCount }}</div>
                        <div class="stat-label">Drafts</div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card">
                    <div class="stat-icon category">
                        <i class="fa fa-folder-open"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-number">{{ categories.length }}</div>
                        <div class="stat-label">Categories</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">Loading articles...</p>
        </div>

        <!-- Blogs Table -->
        <div v-else class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">
                    <i class="fa fa-list"></i> Articles List
                </h5>
                <span class="badge bg-primary">{{ filteredBlogs.length }} article(s)</span>
            </div>
            <div class="table-responsive">
                <table class="table table-hover mb-0">
                    <thead class="table-dark">
                        <tr>
                            <th>Image</th>
                            <th>Title</th>
                            <th>Author</th>
                            <th>Category</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th class="text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="filteredBlogs.length === 0">
                            <td colspan="7" class="text-center py-5">
                                <div class="empty-state">
                                    <i class="fa fa-inbox fa-3x text-muted mb-3"></i>
                                    <p class="text-muted">No blogs found matching your filters</p>
                                </div>
                            </td>
                        </tr>
                        <tr v-for="blog in paginatedBlogs" :key="blog.id" class="blog-row">
                            <td>
                                <img v-if="blog.image" :src="`/img/blogs/${blog.image}`"
                                     :alt="blog.title" class="table-image" loading="lazy">
                                <span v-else class="badge bg-secondary">No Image</span>
                            </td>
                            <td>
                                <div class="blog-title-cell">
                                    <strong>{{ blog.title }}</strong>
                                    <div class="blog-excerpt">{{ getExcerpt(blog.content, 60) }}</div>
                                </div>
                            </td>
                            <td>
                                <div class="author-info">
                                    <i class="fa fa-user-circle"></i>
                                    {{ blog.author }}
                                </div>
                            </td>
                            <td>
                                <span v-if="blog.category" class="badge bg-info">
                                    <i class="fa fa-folder"></i> {{ blog.category.title }}
                                </span>
                                <span v-else class="badge bg-secondary">Uncategorized</span>
                            </td>
                            <td>
                                <button @click="togglePublish(blog)"
                                        :class="['badge', 'cursor-pointer', blog.is_published ? 'bg-success' : 'bg-warning']"
                                        :title="blog.is_published ? 'Click to unpublish' : 'Click to publish'">
                                    <i :class="blog.is_published ? 'fa fa-check-circle' : 'fa fa-clock-o'"></i>
                                    {{ blog.is_published ? 'Published' : 'Draft' }}
                                </button>
                            </td>
                            <td>
                                <small class="text-muted">{{ formatDate(blog.created_at) }}</small>
                            </td>
                            <td>
                                <div class="action-buttons">
                                    <Link :href="`/admin/blogs/${blog.id}`"
                                          class="btn btn-sm btn-info"
                                          title="View Article">
                                        <i class="fa fa-eye"></i>
                                    </Link>
                                    <Link :href="`/admin/blogs/${blog.id}/edit`"
                                          class="btn btn-sm btn-warning"
                                          title="Edit Article">
                                        <i class="fa fa-pencil"></i>
                                    </Link>
                                    <button @click="deleteBlog(blog)"
                                            class="btn btn-sm btn-danger"
                                            title="Delete Article">
                                        <i class="fa fa-trash"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Pagination -->
            <div v-if="totalPages > 1" class="card-footer d-flex justify-content-between align-items-center">
                <div class="text-muted small">
                    Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ Math.min(currentPage * pageSize, filteredBlogs.length) }} of {{ filteredBlogs.length }} articles
                </div>
                <nav>
                    <ul class="pagination mb-0">
                        <li class="page-item" :class="{ disabled: currentPage === 1 }">
                            <button class="page-link" @click="currentPage = 1" :disabled="currentPage === 1">
                                <i class="fa fa-angle-double-left"></i> First
                            </button>
                        </li>
                        <li class="page-item" :class="{ disabled: currentPage === 1 }">
                            <button class="page-link" @click="currentPage--" :disabled="currentPage === 1">
                                <i class="fa fa-angle-left"></i> Prev
                            </button>
                        </li>
                        <li v-for="page in paginationRange" :key="page"
                            class="page-item" :class="{ active: page === currentPage }">
                            <button class="page-link" @click="currentPage = page">{{ page }}</button>
                        </li>
                        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                            <button class="page-link" @click="currentPage++" :disabled="currentPage === totalPages">
                                Next <i class="fa fa-angle-right"></i>
                            </button>
                        </li>
                        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                            <button class="page-link" @click="currentPage = totalPages" :disabled="currentPage === totalPages">
                                Last <i class="fa fa-angle-double-right"></i>
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { Link } from '@inertiajs/vue3'
import axios from 'axios'

const blogs = ref([])
const categories = ref([])
const loading = ref(false)
const searchQuery = ref('')
const filterCategory = ref('')
const filterStatus = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

const filteredBlogs = computed(() => {
    let filtered = blogs.value

    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(b =>
            b.title.toLowerCase().includes(query) ||
            b.author.toLowerCase().includes(query)
        )
    }

    if (filterCategory.value) {
        filtered = filtered.filter(b => b.blog_category_id == filterCategory.value)
    }

    if (filterStatus.value) {
        filtered = filtered.filter(b =>
            filterStatus.value === 'published' ? b.is_published : !b.is_published
        )
    }

    return filtered
})

const totalBlogs = computed(() => blogs.value.length)
const publishedCount = computed(() => blogs.value.filter(b => b.is_published).length)
const draftCount = computed(() => blogs.value.filter(b => !b.is_published).length)
const totalPages = computed(() => Math.ceil(filteredBlogs.value.length / pageSize.value))

const paginatedBlogs = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return filteredBlogs.value.slice(start, start + pageSize.value)
})

const paginationRange = computed(() => {
    const range = []
    const max = 5
    let start = Math.max(1, currentPage.value - Math.floor(max / 2))
    let end = Math.min(totalPages.value, start + max - 1)

    if (end - start + 1 < max) {
        start = Math.max(1, end - max + 1)
    }

    for (let i = start; i <= end; i++) {
        range.push(i)
    }
    return range
})

const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

const getExcerpt = (content, length = 60) => {
    if (!content) return 'No description'
    const text = content.replace(/<[^>]*>/g, '')
    return text.length > length ? text.substring(0, length) + '...' : text
}

const fetchBlogs = async () => {
    loading.value = true
    try {
        const res = await axios.get('/api/blogs?per_page=100')
        if (res.data.success) {
            blogs.value = res.data.data.data || res.data.data
        }
    } catch (error) {
        console.error('Error fetching blogs:', error)
    } finally {
        loading.value = false
    }
}

const fetchCategories = async () => {
    try {
        const res = await axios.get('/api/blog-categories')
        if (res.data.success) {
            categories.value = res.data.data
        }
    } catch (error) {
        console.error('Error fetching categories:', error)
    }
}

const deleteBlog = async (blog) => {
    if (!confirm(`Are you sure you want to delete "${blog.title}"?`)) return

    try {
        const res = await axios.delete(`/api/blogs/${blog.id}`)
        if (res.data.success) {
            blogs.value = blogs.value.filter(b => b.id !== blog.id)
            if (paginatedBlogs.value.length === 0 && currentPage.value > 1) {
                currentPage.value--
            }
        }
    } catch (error) {
        console.error('Error deleting blog:', error)
        alert('Error deleting blog')
    }
}

const togglePublish = async (blog) => {
    try {
        const res = await axios.post(`/api/blogs/${blog.id}/toggle-publish`)
        if (res.data.success) {
            blog.is_published = !blog.is_published
        }
    } catch (error) {
        console.error('Error updating blog:', error)
    }
}

const clearFilters = () => {
    searchQuery.value = ''
    filterCategory.value = ''
    filterStatus.value = ''
    currentPage.value = 1
}

onMounted(() => {
    fetchBlogs()
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
    color: #ffd100;
    font-size: 2.2rem;
}

.page-subtitle {
    color: #666;
    margin: 5px 0 0 0;
    font-size: 0.95rem;
}

.filters-card {
    border: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    border-radius: 8px;
}

.stat-card {
    background: white;
    padding: 20px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 15px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.stat-icon {
    width: 50px;
    height: 50px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    background: #fff8e1;
    color: #ffd100;
}

.stat-icon.published {
    background: #e8f5e9;
    color: #27ae60;
}

.stat-icon.draft {
    background: #fff3e0;
    color: #f39c12;
}

.stat-icon.category {
    background: #f3e5f5;
    color: #9c27b0;
}

.stat-number {
    font-size: 1.5rem;
    font-weight: 700;
    color: #333;
}

.stat-label {
    font-size: 0.85rem;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.table-image {
    width: 50px;
    height: 50px;
    object-fit: cover;
    border-radius: 4px;
}

.blog-title-cell {
    max-width: 350px;
}

.blog-excerpt {
    font-size: 0.85rem;
    color: #999;
    margin-top: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.author-info {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #666;
}

.author-info i {
    color: #ffd100;
}

.action-buttons {
    display: flex;
    gap: 5px;
    justify-content: center;
}

.action-buttons .btn {
    padding: 4px 8px;
    font-size: 0.85rem;
}

.card {
    border: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    border-radius: 8px;
}

.card-header {
    background: #f9f9f9;
    border-bottom: 1px solid #e5e7eb;
    padding: 15px 20px;
    border-radius: 8px 8px 0 0;
}

.table {
    margin-bottom: 0;
}

.blog-row:hover {
    background-color: #f9f9f9;
}

.table thead th {
    border: none;
    font-weight: 600;
    padding: 15px;
    background: #2c3e50;
    color: white;
}

.table tbody td {
    border-color: #e5e7eb;
    padding: 15px;
    vertical-align: middle;
}

.badge {
    padding: 6px 12px;
    font-size: 0.85rem;
    font-weight: 600;
}

.badge.cursor-pointer {
    cursor: pointer;
    transition: all 0.3s ease;
}

.badge.cursor-pointer:hover {
    opacity: 0.8;
}

.card-footer {
    background: #f9f9f9;
    border-top: 1px solid #e5e7eb;
    padding: 15px 20px;
    border-radius: 0 0 8px 8px;
}

.empty-state {
    padding: 20px 0;
}

.pagination {
    gap: 5px;
}

.page-link {
    border-radius: 4px;
    border: 1px solid #dee2e6;
    color: #ffd100;
    font-weight: 500;
}

.page-link:hover {
    background: #ffd100;
    color: #333;
    border-color: #ffd100;
}

.page-item.active .page-link {
    background: #ffd100;
    border-color: #ffd100;
    color: #333;
}

.input-group-text {
    background: white;
    border-right: none;
}

.form-control:focus {
    border-color: #ffd100;
    box-shadow: 0 0 0 0.2rem rgba(255, 209, 0, 0.25);
}
</style>

