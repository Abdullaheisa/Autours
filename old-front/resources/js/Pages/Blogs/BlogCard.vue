<template>
    <div class="blog-card">
        <!-- IMAGE SECTION -->
        <div class="blog-image-wrapper">
            <img
                v-if="blog.image"
                :src="`/img/blogs/${blog.image}`"
                :alt="blog.title"
                class="blog-image"/>
            <div v-else class="blog-image-placeholder">
                <span class="placeholder-icon">📝</span>
            </div>
            <div class="image-overlay">
                <button @click="openBlog" class="btn-read-more">
                    Read Article →
                </button>
            </div>
        </div>

        <!-- CONTENT SECTION -->
        <div class="blog-content">
            <!-- CATEGORY BADGE -->
            <div class="blog-meta-header">
                <span v-if="blog.category" class="category-badge">
                    {{ blog.category.title }}
                </span>
                <span v-else class="category-badge default">
                    Uncategorized
                </span>
                <span v-if="blog.is_published" class="status-badge published">
                    Published
                </span>
                <span v-else class="status-badge draft">
                    Draft
                </span>
            </div>

            <!-- TITLE -->
            <h4 class="blog-title">{{ blog.title }}</h4>

            <!-- AUTHOR & DATE -->
            <div class="blog-meta">
                <span class="author">
                    <span class="icon">✍️</span>
                    {{ blog.author }}
                </span>
                <span class="date">
                    <span class="icon">📅</span>
                    {{ formatDate(blog.created_at) }}
                </span>
            </div>

            <!-- EXCERPT -->
            <p class="blog-excerpt">
                {{ getExcerpt(blog.content, 100) }}
            </p>

            <!-- FOOTER -->
            <div class="blog-footer">
                <button @click="openBlog" class="read-more-link">
                    <span>Read Full Article</span>
                    <span class="arrow">→</span>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
    blog: {
        type: Object,
        required: true
    }
})

const emit = defineEmits(['view-blog'])

const formatDate = (date) => {
    if (!date) return 'Unknown'
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}

const getExcerpt = (content, length = 100) => {
    if (!content) return 'No description available'
    const text = content.replace(/<[^>]*>/g, '')
    return text.length > length ? text.substring(0, length) + '...' : text
}

const openBlog = () => {
    emit('view-blog', props.blog.id)
}
</script>

<style scoped>
:root {
    --primary-color: #4096ee;
    --primary-dark: #1677DD;
    --secondary-color: #f5f7fa;
    --text-dark: #1f2937;
    --text-light: #6b7280;
    --border-color: #e5e7eb;
    --success-color: #52c41a;
    --warning-color: #faad14;
}

.blog-card {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    flex-direction: column;
    height: 100%;
}

.blog-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
}

/* IMAGE SECTION */
.blog-image-wrapper {
    position: relative;
    width: 100%;
    height: 220px;
    overflow: hidden;
    background: var(--secondary-color);
}

.blog-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s ease;
}

.blog-card:hover .blog-image {
    transform: scale(1.08);
}

.blog-image-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.placeholder-icon {
    font-size: 3rem;
}

/* IMAGE OVERLAY */
.image-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.blog-card:hover .image-overlay {
    opacity: 1;
}

.btn-read-more {
    background: white;
    color: var(--primary-color);
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn-read-more:hover {
    background: var(--primary-color);
    color: white;
    transform: scale(1.05);
}

/* CONTENT SECTION */
.blog-content {
    padding: 24px;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
}

/* META HEADER */
.blog-meta-header {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
    flex-wrap: wrap;
}

.category-badge {
    display: inline-block;
    background: var(--primary-color);
    color: white;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.category-badge.default {
    background: var(--text-light);
}

.status-badge {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.status-badge.published {
    background: #d4edda;
    color: #155724;
}

.status-badge.draft {
    background: #fff3cd;
    color: #856404;
}

/* TITLE */
.blog-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-dark);
    margin: 12px 0;
    line-height: 1.4;
    transition: color 0.3s ease;
}

.blog-card:hover .blog-title {
    color: var(--primary-color);
}

/* META INFO */
.blog-meta {
    display: flex;
    gap: 16px;
    margin: 12px 0;
    font-size: 0.9rem;
    color: var(--text-light);
    flex-wrap: wrap;
}

.author,
.date {
    display: flex;
    align-items: center;
    gap: 4px;
}

.icon {
    font-size: 1rem;
}

/* EXCERPT */
.blog-excerpt {
    flex-grow: 1;
    color: var(--text-light);
    font-size: 0.95rem;
    line-height: 1.6;
    margin: 12px 0;
}

/* FOOTER */
.blog-footer {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--border-color);
}

.read-more-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--primary-color);
    text-decoration: none;
    font-weight: 600;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    transition: all 0.3s ease;
}

.read-more-link:hover {
    color: var(--primary-dark);
}

.read-more-link:hover .arrow {
    transform: translateX(4px);
}

.arrow {
    transition: transform 0.3s ease;
    font-size: 1.1rem;
}

/* RESPONSIVE */
@media (max-width: 768px) {
    .blog-content {
        padding: 16px;
    }

    .blog-title {
        font-size: 1.1rem;
    }

    .blog-image-wrapper {
        height: 180px;
    }
}
</style>
