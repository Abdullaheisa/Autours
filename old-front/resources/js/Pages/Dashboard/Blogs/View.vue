<template>
    <div class="container">
        <div class="page-header">
            <div>
                <h1 class="page-title">
                    <i class="fa fa-file-text-o"></i> View Article
                </h1>
                <p class="page-subtitle">Article details and information</p>
            </div>
            <div class="header-actions">
                <Link :href="`/admin/blogs/${blogId}/edit`" class="btn btn-warning">
                    <i class="fa fa-edit"></i> Edit
                </Link>
                <Link href="/admin/blogs" class="btn btn-secondary">
                    <i class="fa fa-arrow-left"></i> Back
                </Link>
            </div>
        </div>

        <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary"></div>
        </div>

        <div v-else-if="blog" class="row">
            <!-- Main Content -->
            <div class="col-lg-8">
                <!-- Article Card -->
                <div class="card article-card">
                    <img v-if="blog.image" :src="`/img/blogs/${blog.image}`" class="card-img-top article-image" :alt="blog.title">
                    <div class="card-body">
                        <h1 class="article-title">{{ blog.title }}</h1>

                        <div class="article-meta">
                            <span class="meta-item">
                                <i class="fa fa-user"></i> {{ blog.author }}
                            </span>
                            <span class="meta-item">
                                <i class="fa fa-calendar"></i> {{ formatDate(blog.created_at) }}
                            </span>
                            <span v-if="blog.category" class="meta-item">
                                <i class="fa fa-folder"></i> {{ blog.category.title }}
                            </span>
                        </div>

                        <hr>

                        <div class="article-content">
                            {{ blog.content }}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Sidebar -->
            <div class="col-lg-4">
                <!-- Info Card -->
                <div class="card info-card">
                    <div class="card-header">
                        <h5 class="mb-0">Article Information</h5>
                    </div>
                    <div class="card-body">
                        <div class="info-item">
                            <label>Title</label>
                            <p>{{ blog.title }}</p>
                        </div>
                        <div class="info-item">
                            <label>Author</label>
                            <p>{{ blog.author }}</p>
                        </div>
                        <div class="info-item">
                            <label>Category</label>
                            <p v-if="blog.category">{{ blog.category.title }}</p>
                            <p v-else class="text-muted">-</p>
                        </div>
                        <div class="info-item">
                            <label>Status</label>
                            <p>
                                <span :class="['badge', blog.is_published ? 'bg-success' : 'bg-warning']">
                                    {{ blog.is_published ? 'Published' : 'Draft' }}
                                </span>
                            </p>
                        </div>
                        <div class="info-item">
                            <label>Created</label>
                            <p>{{ formatDate(blog.created_at) }}</p>
                        </div>
                        <div class="info-item">
                            <label>Updated</label>
                            <p>{{ formatDate(blog.updated_at) }}</p>
                        </div>
                    </div>
                </div>

                <!-- Actions Card -->
                <div class="card mt-3">
                    <div class="card-header">
                        <h5 class="mb-0">Actions</h5>
                    </div>
                    <div class="card-body d-grid gap-2">
                        <Link :href="`/admin/blogs/${blogId}/edit`" class="btn btn-warning">
                            <i class="fa fa-edit"></i> Edit Article
                        </Link>
                        <button @click="togglePublish" class="btn" :class="blog.is_published ? 'btn-danger' : 'btn-success'">
                            <i :class="blog.is_published ? 'fa fa-eye-slash' : 'fa fa-eye'"></i>
                            {{ blog.is_published ? 'Unpublish' : 'Publish' }}
                        </button>
                        <button @click="deleteBlog" class="btn btn-danger">
                            <i class="fa fa-trash"></i> Delete
                        </button>
                        <a :href="`/blogs/${blog.id}`" target="_blank" class="btn btn-info">
                            <i class="fa fa-external-link"></i> View Published
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Link, router, usePage } from '@inertiajs/vue3'
import axios from 'axios'

const page = usePage()
const blogId = ref(page.props.blog?.id)

const blog = ref(null)
const loading = ref(true)

const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

const fetchBlog = async () => {
    try {
        const res = await axios.get(`/api/blogs/${blogId.value}`)
        if (res.data.success) {
            blog.value = res.data.data
        }
    } catch (error) {
        console.error('Error fetching blog:', error)
        alert('Error loading article')
    } finally {
        loading.value = false
    }
}

const togglePublish = async () => {
    try {
        const res = await axios.post(`/api/blogs/${blogId.value}/toggle-publish`)
        if (res.data.success) {
            blog.value.is_published = !blog.value.is_published
        }
    } catch (error) {
        console.error('Error:', error)
    }
}

const deleteBlog = async () => {
    if (!confirm('Are you sure you want to delete this article?')) return
    try {
        const res = await axios.delete(`/api/blogs/${blogId.value}`)
        if (res.data.success) {
            alert('Article deleted successfully!')
            router.visit('/admin/blogs')
        }
    } catch (error) {
        console.error('Error:', error)
        alert('Error deleting article')
    }
}

onMounted(() => {
    fetchBlog()
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

.header-actions {
    display: flex;
    gap: 10px;
}

.article-card {
    border: none;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    border-radius: 10px;
    overflow: hidden;
}

.article-image {
    width: 100%;
    max-height: 400px;
    object-fit: cover;
}

.article-title {
    font-size: 2rem;
    font-weight: 700;
    margin: 20px 0 15px;
    color: #333;
}

.article-meta {
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
    padding: 15px 0;
    border-bottom: 1px solid #eee;
    margin-bottom: 20px;
    color: #666;
    font-size: 0.95rem;
}

.meta-item {
    display: flex;
    align-items: center;
    gap: 6px;
}

.meta-item i {
    color: #0066cc;
}

.article-content {
    line-height: 1.8;
    color: #555;
    font-size: 1rem;
    margin: 20px 0;
}

.info-card {
    border: none;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    border-radius: 10px;
}

.card-header {
    background: #f9f9f9;
    border-bottom: 1px solid #eee;
    padding: 15px 20px;
    border-radius: 10px 10px 0 0;
}

.card-header h5 {
    color: #333;
    font-weight: 600;
}

.info-item {
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;
}

.info-item:last-child {
    border-bottom: none;
}

.info-item label {
    display: block;
    font-weight: 600;
    color: #666;
    font-size: 0.85rem;
    text-transform: uppercase;
    margin-bottom: 4px;
}

.info-item p {
    margin: 0;
    color: #333;
    font-size: 0.95rem;
}

.badge {
    padding: 6px 12px;
    font-size: 0.85rem;
    font-weight: 600;
}

.btn {
    border-radius: 6px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s ease;
}

.btn-warning {
    background: #f39c12;
    border-color: #f39c12;
    color: white;
}

.btn-warning:hover {
    background: #e67e22;
    border-color: #e67e22;
}

.btn-secondary {
    background: #6c757d;
    border-color: #6c757d;
}

.btn-success {
    background: #27ae60;
    border-color: #27ae60;
}

.btn-danger {
    background: #e74c3c;
    border-color: #e74c3c;
}

.btn-info {
    background: #3498db;
    border-color: #3498db;
}

.d-grid {
    display: grid;
}

.gap-2 {
    gap: 10px;
}

.card {
    border: none;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    border-radius: 10px;
}
</style>

