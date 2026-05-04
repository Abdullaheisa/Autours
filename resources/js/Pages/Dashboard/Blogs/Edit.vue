<template>
    <div class="container">
        <div class="page-header">
            <div>
                <h1 class="page-title">
                    <i class="fa fa-edit"></i> Edit Article
                </h1>
                <p class="page-subtitle">Update blog article details</p>
            </div>
            <Link href="/admin/blogs" class="btn btn-secondary">
                <i class="fa fa-arrow-left"></i> Back
            </Link>
        </div>

        <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary"></div>
        </div>

        <div v-else class="card form-card">
            <div class="card-body">
                <form @submit.prevent="submitForm">
                    <div class="row">
                        <div class="col-lg-8">
                            <div class="mb-4">
                                <label class="form-label">Title *</label>
                                <input v-model="form.title" type="text" class="form-control form-control-lg" required>
                            </div>

                            <div class="mb-4">
                                <label class="form-label">Slug (URL-friendly)</label>
                                <input v-model="form.slug" type="text" class="form-control" placeholder="Leave empty to auto-generate">
                                <small class="text-muted">Auto-generated from title if left empty</small>
                            </div>

                            <div class="mb-4">
                                <label class="form-label">Author *</label>
                                <input v-model="form.author" type="text" class="form-control" required>
                            </div>

                            <div class="mb-4">
                                <label class="form-label">Category *</label>
                                <select v-model="form.blog_category_id" class="form-control form-control-lg" required>
                                    <option value="">Select a category</option>
                                    <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                                        {{ cat.title }}
                                    </option>
                                </select>
                            </div>

                            <div class="mb-4">
                                <label class="form-label">Content *</label>
                                <Editor v-model="form.content"  style="height: 200px" required></Editor>
                            </div>

                            <!-- SEO Section -->
                            <div class="card border-light mt-4">
                                <div class="card-header bg-light">
                                    <h6 class="mb-0">
                                        <i class="fa fa-search"></i> SEO Settings
                                    </h6>
                                </div>
                                <div class="card-body">
                                    <div class="mb-4">
                                        <label class="form-label">Meta Description (for search engines)</label>
                                        <textarea v-model="form.meta_description" class="form-control" rows="3" maxlength="500" placeholder="Brief description for search engine results (max 160 characters recommended)"></textarea>
                                        <small class="text-muted">{{ form.meta_description.length }}/500 characters</small>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="col-lg-4">
                            <div class="mb-4">
                                <label class="form-label">Featured Image</label>
                                <div class="image-upload-box">
                                    <img v-if="imagePreview || form.currentImage" :src="imagePreview || `/img/blogs/${form.currentImage}`" :alt="form.image_alt_text || 'Blog image'" class="preview-image">
                                    <div v-else class="upload-placeholder">
                                        <i class="fa fa-image"></i>
                                        <p>No image</p>
                                    </div>
                                    <input @change="handleImageUpload" type="file" class="form-control form-control-sm" accept="image/*">
                                </div>
                                <div class="mt-2">
                                    <label class="form-label">Image Alt Text (for accessibility)</label>
                                    <input v-model="form.image_alt_text" type="text" class="form-control form-control-sm" placeholder="Describe the image content">
                                    <small class="text-muted">Important for SEO and accessibility</small>
                                </div>
                            </div>

                            <div class="mb-4 p-3 bg-light rounded">
                                <label class="form-label mb-3">Status</label>
                                <div class="form-check">
                                    <input v-model="form.is_published" type="checkbox" class="form-check-input" id="publishCheck">
                                    <label class="form-check-label" for="publishCheck">
                                        <span v-if="form.is_published" class="badge bg-success">Published</span>
                                        <span v-else class="badge bg-warning">Draft</span>
                                    </label>
                                </div>
                            </div>

                            <div class="d-grid gap-2">
                                <button type="submit" class="btn btn-primary btn-lg" :disabled="submitting">
                                    <i class="fa fa-save"></i> Update
                                </button>
                                <Link href="/admin/blogs" class="btn btn-outline-secondary">Cancel</Link>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import {ref, onMounted, computed} from 'vue'
import { Link, router } from '@inertiajs/vue3'
import axios from 'axios'
import Editor from 'primevue/editor';

import 'vue-toast-notification/dist/theme-sugar.css';

const form = ref({
    title: '',
    slug: '',
    author: '',
    blog_category_id: '',
    content: '',
    meta_description: '',
    image_alt_text: '',
    is_published: false,
    image: null,
    currentImage: null
})

const imagePreview = ref(null)
const categories = ref([])
const loading = ref(true)
const submitting = ref(false)

const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
        form.value.image = file
        const reader = new FileReader()
        reader.onload = (e) => {
            imagePreview.value = e.target.result
        }
        reader.readAsDataURL(file)
    }
}

const submitForm = async () => {
    submitting.value = true
    try {
        const formData = new FormData()
        formData.append('title', form.value.title)
        formData.append('slug', form.value.slug)
        formData.append('author', form.value.author)
        formData.append('blog_category_id', form.value.blog_category_id)
        formData.append('content', form.value.content)
        formData.append('meta_description', form.value.meta_description)
        formData.append('image_alt_text', form.value.image_alt_text)
        formData.append('is_published', form.value.is_published ? '1' : '0')
        if (form.value.image) {
            formData.append('image', form.value.image)
        }

        const res = await axios.post(`/api/blogs/${blogId.value}?_method=PUT`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })

        if (res.data.success) {
            alert('Article updated successfully!')
            router.visit('/admin/blogs')
        }
    } catch (error) {
        console.error('Error:', error)
        alert('Error updating article')
    } finally {
        submitting.value = false
    }
}

const fetchBlog = async () => {
    try {
        const res = await axios.get(`/api/blogs/${blogId.value}`)
        if (res.data.success) {
            const blog = res.data.data
            form.value = {
                title: blog.title,
                slug: blog.slug || '',
                author: blog.author,
                blog_category_id: blog.blog_category_id,
                content: blog.content,
                meta_description: blog.meta_description || '',
                image_alt_text: blog.image_alt_text || '',
                is_published: blog.is_published === true || blog.is_published === 1 || blog.is_published === '1',
                image: null,
                currentImage: blog.image
            }
        }
    } catch (error) {
        console.error('Error fetching blog:', error)
        alert('Error loading article')
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

onMounted(() => {
    fetchBlog()
    fetchCategories()
})
const blogId = computed(() => window.location.pathname.split('/')[3])
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

.form-card {
    border: none;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    border-radius: 10px;
}

.form-control {
    border-radius: 6px;
    padding: 10px 15px;
}

.form-control:focus {
    border-color: #ffd100;
    box-shadow: 0 0 0 0.2rem rgba(255, 209, 0, 0.25);
}

.form-label {
    font-weight: 600;
    margin-bottom: 8px;
    color: #333;
}

.image-upload-box {
    border: 2px dashed #dee2e6;
    border-radius: 8px;
    padding: 15px;
    text-align: center;
    transition: all 0.3s ease;
}

.image-upload-box:hover {
    border-color: #ffd100;
    background: rgba(255, 209, 0, 0.05);
}

.upload-placeholder {
    color: #999;
    padding: 30px 10px;
}

.upload-placeholder i {
    font-size: 2.5rem;
    display: block;
    margin-bottom: 10px;
}

.preview-image {
    max-width: 100%;
    max-height: 250px;
    border-radius: 6px;
    margin-bottom: 10px;
}

.bg-light {
    background: #f9f9f9 !important;
}

.btn {
    border-radius: 6px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 8px;
}

.btn-primary {
    background: #ffd100;
    border-color: #ffd100;
    color: #333;
}

.btn-primary:hover {
    background: #f0c000;
    border-color: #f0c000;
}

.btn-secondary {
    background: #6c757d;
    border-color: #6c757d;
}

.d-grid {
    display: grid;
}

.gap-2 {
    gap: 12px;
}

.badge {
    padding: 6px 12px;
    font-size: 0.85rem;
    font-weight: 600;
}
</style>

