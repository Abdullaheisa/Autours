<template>
    <div id="wrapper">
        <!-- header begin -->
        <header-one/>
        <!-- header close -->

        <!-- content begin -->
        <div class="no-bottom no-top" id="content">
            <div id="top"></div>

            <!-- HERO SECTION - Professional Header -->
            <section class="blog-hero" style="background-image: url(img/banner-bk.jpg)">
                <div class="container mt-5">
                    <div class="hero-content">
                        <h1 class="hero-title">Autours Blog</h1>
                        <p class="hero-subtitle">Discover travel tips, destination guides, and car rental insights</p>
                        <div class="search-box-hero">
                            <input
                                v-model="searchQuery"
                                type="text"
                                class="search-input-hero"
                                placeholder="Search articles...">
                            <button class="search-btn-hero">
                                <i class="fa fa-search"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <!-- MAIN CONTENT -->
            <section class="blog-section py-5">
                <div class="container">
                    <div class="row">
                        <!-- MAIN CONTENT - BLOGS (full width, sidebar removed) -->
                        <div class="col-12">
                            <!-- LOADING STATE -->
                            <div v-if="loading" class="text-center py-5">
                                <div class="spinner-border text-primary" role="status">
                                    <span class="visually-hidden">Loading...</span>
                                </div>
                                <p class="mt-2">Loading articles...</p>
                            </div>

                            <!-- BLOGS LIST - CARD GRID -->
                            <div v-if="filteredBlogs.length > 0" class="blog-list">
                                <div class="blog-grid">
                                    <div v-for="blog in filteredBlogs"
                                         :key="blog.id"
                                         class="blog-item-card">
                                        <!-- Blog Image -->
                                        <div class="blog-image-section">
                                            <img v-if="blog.image"
                                                 :src="`/img/blogs/${blog.image}`"
                                                 :alt="blog.title"
                                                 class="blog-image"/>
                                            <div v-else class="blog-image-placeholder">
                                                <i class="fa fa-newspaper-o"></i>
                                            </div>
                                            <span v-if="blog.category" class="blog-category-badge">
                                                {{ blog.category.title }}
                                            </span>
                                            <div class="blog-image-overlay">
                                                <button class="read-btn-overlay" @click="viewBlogDetails(blog)">
                                                    <i class="fa fa-arrow-right"></i>
                                                </button>
                                            </div>
                                        </div>

                                        <!-- Blog Content -->
                                        <div class="blog-content-section">
                                            <div class="blog-meta">
                                                <span class="post-date">
                                                    <i class="fa fa-calendar"></i> {{ formatDate(blog.created_at) }}
                                                </span>
                                                <span class="post-author">
                                                    <i class="fa fa-user"></i> {{ blog.author }}
                                                </span>
                                            </div>

                                            <h3 class="blog-item-title">{{ blog.title }}</h3>

                                            <p class="blog-excerpt">
                                                {{ getExcerpt(blog.content, 100) }}
                                            </p>

                                            <a @click="viewBlogDetails(blog)" class="read-more-link">
                                                Read More
                                                <i class="fa fa-arrow-right"></i>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- EMPTY STATE -->
                            <div v-else class="empty-state">
                                <i class="fa fa-inbox"></i>
                                <h5>No articles found</h5>
                                <p>Try adjusting your search query</p>
                            </div>

                            <!-- DEBUG PANEL - SHOW IF NO ARTICLES AND FETCH ATTEMPTS EXIST -->
                            <div v-if="filteredBlogs.length === 0 && fetchAttempts.length > 0" class="debug-panel">
                                <h6 class="debug-title">Debug Info - Fetch Attempts</h6>
                                <div v-for="(attempt, index) in fetchAttempts" :key="index" class="debug-attempt">
                                    <div class="attempt-url">
                                        <strong>Attempt {{ index + 1 }}:</strong> {{ attempt.url }}
                                    </div>
                                    <div class="attempt-status">
                                        Status: <strong>{{ attempt.ok ? 'Success' : 'Failed' }}</strong>
                                    </div>
                                    <div class="attempt-details" v-if="!attempt.ok">
                                        Error: {{ attempt.error }}
                                    </div>
                                </div>

                                <!-- LAST RESPONSE RAW DATA (JSON) - PRETTY PRINTED -->
                                <div v-if="lastResponse" class="last-response">
                                    <h6>Last Response (Raw Data)</h6>
                                    <pre class="response-json">{{ JSON.stringify(lastResponse.data, null, 2) }}</pre>
                                </div>

                                <div class="text-center mt-3">
                                    <button class="btn btn-primary" @click="showRawResponse = !showRawResponse">
                                        <i class="fa" :class="showRawResponse ? 'fa-eye-slash' : 'fa-eye'"></i>
                                        Toggle Raw Response
                                    </button>
                                </div>

                                <!-- SHOW RAW RESPONSE AS PLAIN TEXT -->
                                <div v-if="showRawResponse" class="raw-response-text">
                                    <h6>Raw Response (Text)</h6>
                                    <pre>{{ lastResponse }}</pre>
                                </div>

                                <!-- NEW: PUBLISHED COUNT AND TOGGLE FALLBACK BUTTON -->
                                <div class="debug-stats">
                                    <div>Fetched: {{ blogs.length }} • Published detected: {{ publishedCount }}</div>
                                    <button class="btn btn-sm btn-outline-primary" @click="toggleShowAllFallback()">
                                        {{ showAllFallback ? 'Showing all (fallback ON)' : 'Show all (enable fallback)' }}
                                    </button>
                                </div>
                            </div>

                            <!-- pagination removed -->

                        </div>

                    </div>
                </div>
            </section>
        </div>
        <!-- content close -->

        <!-- footer begin -->
        <!-- footer close -->
    </div>
    <Footer />

</template>

<script setup>
import {ref, onMounted, computed} from 'vue'
import axios from 'axios'
import HeaderOne from '@/components/HeaderOne.vue'
import Footer from '@/components/Footer.vue'

// Data
const blogs = ref([])
const loading = ref(false)
const searchQuery = ref('')
const showAllFallback = ref(false)
// Debugging: track fetch attempts so mobile issues are diagnosable
const fetchAttempts = ref([]) // { url, ok, status, count, error }
const lastResponse = ref(null)
const showRawResponse = ref(false)

// Computed properties
const filteredBlogs = computed(() => {
    // start with safe copy
    let filtered = Array.isArray(blogs.value) ? blogs.value.slice() : []

    // Only published items (handle boolean/string/number and common fields)
    const publishedFiltered = filtered.filter(b => {
        if (!b) return false
        return (
            b.is_published === true || b.is_published === 1 || b.is_published === '1' ||
            b.published === true || b.published === 1 || b.published === '1' ||
            String(b.status || '').toLowerCase() === 'published' ||
            String(b.visibility || '').toLowerCase() === 'public'
        )
    })

    // If publishedFiltered has items and no explicit fallback forced, use it; otherwise use all (fallback)
    if (publishedFiltered.length > 0 && !showAllFallback.value) {
        filtered = publishedFiltered
    } else {
        // if publishedFiltered is empty but we have fetched items, enable fallback to show all
        if (!showAllFallback.value && Array.isArray(blogs.value) && blogs.value.length > 0 && publishedFiltered.length === 0) {
            console.warn('No published items detected using standard fields; falling back to show all fetched blogs for visibility (mobile fix).')
            showAllFallback.value = true
        }
        // filtered remains as all blogs
    }

    // Apply top search box only (case-insensitive) - safe guards for missing fields
    if (searchQuery.value && String(searchQuery.value).trim() !== '') {
        const q = String(searchQuery.value).toLowerCase().trim()
        filtered = filtered.filter(blog => {
            const title = String(blog.title || '').toLowerCase()
            const author = String(blog.author || '').toLowerCase()
            const content = String(blog.content || '').toLowerCase()
            return title.includes(q) || author.includes(q) || content.includes(q)
        })
    }

    // Debug: when blogs fetched but none visible
    const fetched = Array.isArray(blogs.value) ? blogs.value.length : 0
    if (fetched > 0 && filtered.length === 0) {
        console.debug('filteredBlogs empty after applying published+search filters', { fetched, searchQuery: searchQuery.value, sample: blogs.value.slice(0,5), showAllFallback: showAllFallback.value })
    }

    return filtered
})

// New computed: publishedCount (useful in debug panel)
const publishedCount = computed(() => {
    return Array.isArray(blogs.value) ? blogs.value.filter(b => b && (
        b.is_published === true || b.is_published === 1 || b.is_published === '1' ||
        b.published === true || b.published === 1 || b.published === '1' ||
        String(b.status || '').toLowerCase() === 'published' ||
        String(b.visibility || '').toLowerCase() === 'public'
    )).length : 0
})

// Toggle force fallback
const toggleShowAllFallback = () => {
    showAllFallback.value = !showAllFallback.value
}


// Methods
const formatDate = (date) => {
    if (!date) return 'Unknown'
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}

const getExcerpt = (content, length = 150) => {
    if (!content) return 'No description available'
    const text = String(content).replace(/<[^>]*>/g, '')
    return text.length > length ? text.substring(0, length) + '...' : text
}

const fetchBlogs = async () => {
    loading.value = true
    fetchAttempts.value = []
    lastResponse.value = null

    try {
        // Try multiple endpoints to handle mobile/base-href differences
        const tryUrls = [
            '/api/blogs',
            'api/blogs',
            (window.location.origin ? `${window.location.origin}/api/blogs` : null)
        ].filter(Boolean)

        let data = []
        let lastRes = null
        for (const url of tryUrls) {
            try {
                console.debug('fetchBlogs: trying', url)
                const res = await axios.get(url)
                lastRes = res
                lastResponse.value = res
                if (!res || !res.data) {
                    console.debug('fetchBlogs: empty res.data for', url)
                    fetchAttempts.value.push({ url, ok: false, status: res?.status || null, count: 0, error: 'empty res.data' })
                    continue
                }
                // Normalize possible shapes
                if (Array.isArray(res.data)) data = res.data
                else if (Array.isArray(res.data.data)) data = res.data.data
                else if (Array.isArray(res.data.data?.data)) data = res.data.data.data
                else if (Array.isArray(res.data.items)) data = res.data.items
                else {
                    const possible = Object.values(res.data).find(v => Array.isArray(v))
                    data = Array.isArray(possible) ? possible : []
                }

                const count = Array.isArray(data) ? data.length : 0
                fetchAttempts.value.push({ url, ok: count > 0, status: res?.status || null, count, error: null })

                if (Array.isArray(data) && data.length > 0) {
                    console.debug('fetchBlogs: got data from', url, 'count=', data.length)
                    break
                } else {
                    console.debug('fetchBlogs: normalized data empty for', url)
                }
            } catch (err) {
                console.warn('fetchBlogs: request failed for', url, err && err.message)
                fetchAttempts.value.push({ url, ok: false, status: err?.response?.status || null, count: 0, error: err.message || String(err) })
                // try next
            }
        }

        // If still empty and lastRes exists, attempt to inspect lastRes to find any nested arrays
        if ((!data || data.length === 0) && lastRes && lastRes.data) {
            const flatVals = Object.values(lastRes.data).filter(v => v && typeof v === 'object')
            // attempt to pull first array inside nested objects
            for (const v of flatVals) {
                if (Array.isArray(v)) {
                    data = v; break
                }
                if (v && typeof v === 'object') {
                    const nestedArray = Object.values(v).find(x => Array.isArray(x))
                    if (Array.isArray(nestedArray)) { data = nestedArray; break }
                }
            }
            // Log this inspection as a pseudo-attempt
            fetchAttempts.value.push({ url: 'inspect-last-res', ok: Array.isArray(data) && data.length > 0, status: lastRes?.status || null, count: Array.isArray(data) ? data.length : 0, error: null })
        }

        blogs.value = Array.isArray(data) ? data : []
        console.debug('fetchBlogs final count=', blogs.value.length)

        // Recompute publishedCount and set fallback
        const publishedCount = Array.isArray(blogs.value) ? blogs.value.filter(b => b && (
            b.is_published === true || b.is_published === 1 || b.is_published === '1' ||
            b.published === true || b.published === 1 || b.published === '1' ||
            String(b.status || '').toLowerCase() === 'published' ||
            String(b.visibility || '').toLowerCase() === 'public'
        )).length : 0

        if (blogs.value.length > 0 && publishedCount === 0) {
            console.warn('No published items detected; enabling fallback to show all fetched blogs. publishedCount=0, total=', blogs.value.length)
            showAllFallback.value = true
        } else {
            showAllFallback.value = false
        }

    } catch (error) {
        console.error('Error fetching blogs (outer):', error)
        fetchAttempts.value.push({ url: 'outer-exception', ok: false, status: null, count: 0, error: error.message || String(error) })
    } finally {
        loading.value = false
    }
}

const viewBlogDetails = (blog) => {
    window.location.href = `/blogs/${blog.slug}`
}

onMounted(() => {
    fetchBlogs()
})
</script>

<style scoped>
:root {
    --primary-color: #0066cc;
    --secondary-color: #f9f9f9;
    --text-dark: #333333;
    --text-light: #666666;
    --border-color: #e0e0e0;
    --accent-color: #ffd100;
}

/* HERO SECTION */
.blog-hero {
    background: #ecd675;
    padding: 80px 0;
    color: white;
}

.hero-content {

    text-align: center;
}

.hero-title {
    font-size: 3.5rem;
    font-weight: 700;
    margin-bottom: 15px;
    letter-spacing: -1px;
}

.hero-subtitle {
    font-size: 1.3rem;
    font-weight: 300;
    margin-bottom: 40px;
    opacity: 0.95;
}

.search-box-hero {
    display: flex;
    max-width: 500px;
    margin: 0 auto;
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.search-input-hero {
    flex: 1;
    border: none;
    padding: 15px 20px;
    font-size: 1rem;
    outline: none;
}

.search-btn-hero {
    background: var(--primary-color);
    border: none;
    padding: 0 20px;
    cursor: pointer;
    color: white;
    transition: background 0.3s ease;
}

.search-btn-hero:hover {
    background: #0052a3;
}

/* MAIN SECTION */
.blog-section {
    background: #ffffff;
    padding: 60px 0;
}

/* BLOG LIST */
.blog-list {
    display: flex;
    flex-direction: column;
    gap: 30px;
}

.blog-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 30px;
    width: 100%;
}

.blog-item-card {
    background: white;
    border: 1px solid var(--border-color);
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    animation: slideInUp 0.6s ease forwards;
    opacity: 0;
    display: flex;
    flex-direction: column;
    height: 100%;
}

@keyframes slideInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.blog-item-card:nth-child(1) { animation-delay: 0.1s; }
.blog-item-card:nth-child(2) { animation-delay: 0.2s; }
.blog-item-card:nth-child(3) { animation-delay: 0.3s; }

.blog-item-card:hover {
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
    border-color: var(--primary-color);
    transform: translateY(-8px);
}

/* BLOG IMAGE SECTION */
.blog-image-section {
    flex-shrink: 0;
    position: relative;
    width: 100%;
    height: 220px;
    background: var(--secondary-color);
    cursor: pointer;
    overflow: hidden;
}

.blog-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.blog-item-card:hover .blog-image {
    transform: scale(1.08) rotate(1deg);
}

.blog-image-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #ffd100 0%, #f0c000 100%);
    color: white;
    font-size: 3.5rem;
}

/* CATEGORY BADGE */
.blog-category-badge {
    position: absolute;
    top: 12px;
    right: 12px;
    background: linear-gradient(135deg, var(--primary-color) 0%, #0052a3 100%);
    color: white;
    padding: 7px 14px;
    border-radius: 6px;
    font-size: 0.8rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    box-shadow: 0 3px 10px rgba(0, 102, 204, 0.3);
    backdrop-filter: blur(4px);
}

/* IMAGE OVERLAY */
.blog-image-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.blog-item-card:hover .blog-image-overlay {
    opacity: 1;
}

.read-btn-overlay {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: white;
    border: none;
    color: var(--primary-color);
    font-size: 1.5rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.read-btn-overlay:hover {
    transform: scale(1.15);
    background: var(--primary-color);
    color: white;
}

/* BLOG CONTENT SECTION */
.blog-content-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 25px;
}

/* BLOG META */
.blog-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 15px;
    font-size: 0.85rem;
}

.post-date,
.post-author {
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--text-light);
    transition: all 0.3s ease;
    background: #f5f5f5;
    padding: 6px 10px;
    border-radius: 4px;
}

.post-date:hover,
.post-author:hover {
    color: var(--primary-color);
    background: #fff8e1;
}

.post-date i,
.post-author i {
    font-size: 0.9rem;
    color: var(--primary-color);
}

/* BLOG TITLE */
.blog-item-title {
    font-size: 1.3rem;
    font-weight: 700;
    color: var(--text-dark);
    margin: 12px 0;
    line-height: 1.4;
    transition: color 0.3s ease;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.blog-item-card:hover .blog-item-title {
    color: var(--primary-color);
}

/* EXCERPT */
.blog-excerpt {
    font-size: 0.9rem;
    color: var(--text-light);
    line-height: 1.6;
    margin: 12px 0 20px 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    flex: 1;
}

/* READ MORE LINK */
.read-more-link {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: var(--primary-color);
    text-decoration: none;
    font-weight: 700;
    font-size: 0.9rem;
    transition: all 0.3s ease;
    cursor: pointer;
    margin-top: auto;
}

.read-more-link:hover {
    color: #0052a3;
    gap: 12px;
}

.read-more-link i {
    transition: transform 0.3s ease;
}

.read-more-link:hover i {
    transform: translateX(4px) rotate(15deg);
}

/* RESPONSIVE */
@media (max-width: 1200px) {
    .blog-grid {
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 25px;
    }
}

@media (max-width: 992px) {
    .blog-grid {
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        gap: 20px;
    }

    .blog-item-card {
        animation: none !important;
        opacity: 1;
    }
}

@media (max-width: 768px) {
    .blog-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 18px;
    }

    .blog-image-section {
        height: 180px;
    }

    .blog-item-title {
        font-size: 1.1rem;
    }

    .blog-excerpt {
        font-size: 0.85rem;
    }

    .blog-content-section {
        padding: 18px;
    }

    .blog-meta {
        gap: 8px;
        font-size: 0.8rem;
    }
}

@media (max-width: 576px) {
    .blog-grid {
        grid-template-columns: 1fr;
        gap: 15px;
    }

    .blog-item-card {
        border-radius: 8px;
    }

    .blog-image-section {
        height: 200px;
    }

    .blog-item-title {
        font-size: 1rem;
        margin: 10px 0;
    }

    .blog-excerpt {
        font-size: 0.85rem;
        margin: 10px 0 15px 0;
    }

    .blog-content-section {
        padding: 15px;
    }

    .read-more-link {
        font-size: 0.85rem;
    }
}

/* BLOG ACTIONS */
.blog-actions {
    display: flex;
    gap: 8px;
}

.action-btn {
    width: 36px;
    height: 36px;
    border-radius: 6px;
    border: 1px solid var(--border-color);
    background: white;
    color: var(--text-light);
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.95rem;
}

.action-btn:hover {
    background: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
    transform: scale(1.1);
}

/* EMPTY STATE */
.empty-state {
    text-align: center;
    padding: 100px 40px;
    background: linear-gradient(135deg, rgba(0, 102, 204, 0.05) 0%, rgba(0, 102, 204, 0.02) 100%);
    border: 2px dashed var(--border-color);
    border-radius: 12px;
    animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

.empty-icon {
    font-size: 4rem;
    color: var(--primary-color);
    margin-bottom: 20px;
    opacity: 0.8;
}

.empty-title {
    font-size: 1.5rem;
    color: var(--text-dark);
    margin-bottom: 10px;
    font-weight: 700;
}

.empty-description {
    color: var(--text-light);
    font-size: 1rem;
    margin-bottom: 25px;
    line-height: 1.6;
}

.empty-action-btn {
    background: var(--primary-color);
    color: white;
    border: none;
    padding: 12px 28px;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: inline-flex;
    align-items: center;
    gap: 8px;
}

.empty-action-btn:hover {
    background: #0052a3;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 102, 204, 0.3);
}

/* DEBUG PANEL */
.debug-panel {
    background: #f9f9f9;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 20px;
    margin-top: 30px;
    animation: fadeIn 0.5s ease;
}

.debug-title {
    font-size: 1.2rem;
    font-weight: 700;
    margin-bottom: 15px;
    color: #333;
}

.debug-attempt {
    background: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    padding: 12px 15px;
    margin-bottom: 10px;
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.attempt-url {
    font-weight: 600;
    color: var(--primary-color);
}

.attempt-status {
    font-size: 0.9rem;
    color: var(--text-dark);
}

.attempt-details {
    font-size: 0.85rem;
    color: var(--text-light);
    background: #f5f5f5;
    padding: 8px 10px;
    border-radius: 4px;
}

/* LAST RESPONSE */
.last-response {
    margin-top: 15px;
    padding: 15px;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    background: #fbfbfb;
    overflow-x: auto;
}

.response-json {
    font-family: 'Courier New', Courier, monospace;
    font-size: 0.9rem;
    color: #333;
    white-space: pre-wrap;
    word-wrap: break-word;
}

/* PAGINATION SECTION */
.pagination-section {
    margin-top: 60px;
    padding: 30px 0;
    animation: slideInUp 0.6s ease 0.3s forwards;
    opacity: 0;
}

.pagination-nav {
    text-align: center;
    margin-bottom: 20px;
}

.pagination {
    display: flex;
    justify-content: center;
    gap: 6px;
    flex-wrap: wrap;
    list-style: none;
    padding: 0;
    margin: 0;
}

.page-item {
    margin: 0;
}

.page-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    padding: 10px 14px;
    border: 2px solid var(--border-color);
    background: white;
    color: var(--primary-color);
    text-decoration: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    font-weight: 600;
    font-size: 0.9rem;
    min-width: 44px;
    min-height: 44px;
}

.page-link:hover {
    background: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 102, 204, 0.2);
}

.page-item.active .page-link {
    background: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
    box-shadow: 0 4px 12px rgba(0, 102, 204, 0.3);
}

.page-item.disabled .page-link {
    color: #ccc;
    cursor: not-allowed;
    background: var(--secondary-color);
    border-color: var(--border-color);
}

.page-label {
    display: none;
}

@media (min-width: 576px) {
    .page-label {
        display: inline;
    }
}

.page-number {
    display: none;
}

@media (min-width: 768px) {
    .page-number {
        display: inline-block;
    }
}

.pagination-info {
    text-align: center;
    color: var(--text-light);
    font-size: 0.9rem;
    padding: 15px 0;
    border-top: 1px solid var(--border-color);
}

.pagination-info strong {
    color: var(--primary-color);
    font-weight: 700;
}

/* RESPONSIVE DESIGN */
@media (max-width: 992px) {
    .sidebar-filters {
        position: static;
        margin-top: 30px;
    }

    .filter-widget {
        margin-bottom: 15px;
    }
}

@media (max-width: 768px) {
    .content-header-section {
        margin-bottom: 30px;
        padding-bottom: 15px;
    }

    .content-title {
        font-size: 1.3rem;
    }

    .pagination-section {
        margin-top: 40px;
    }
}

@media (max-width: 576px) {
    .content-header-section {
        margin-bottom: 20px;
    }

    .content-title {
        font-size: 1.1rem;
    }


    .pagination {
        gap: 4px;
    }

    .page-link {
        padding: 8px 10px;
        font-size: 0.8rem;
        min-width: 40px;
        min-height: 40px;
    }

    .empty-state {
        padding: 60px 20px;
    }

    .empty-icon {
        font-size: 3rem;
    }
}
</style>
