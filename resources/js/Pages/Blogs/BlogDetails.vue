<template>
    <div id="wrapper">
        <!-- header begin -->
        <header-one/>
        <!-- header close -->

        <!-- content begin -->
        <div class="no-bottom no-top" id="content">
            <div id="top"></div>

            <!-- LOADING STATE -->
            <div v-if="loading" class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2">Loading article...</p>
            </div>

            <!-- BLOG DETAILS -->
            <div v-else-if="blog" class="blog-details-wrapper">

                <!-- MAIN CONTENT -->
                <section class="blog-content-section">
                    <div class="container-lg">
                        <!-- FEATURED IMAGE SECTION -->
                        <div class="featured-image-wrapper" v-if="blog.image">
                            <div class="featured-container">
                                <img :src="`/img/blogs/${blog.image}`"
                                     :alt="blog.title"
                                     class="featured-image"/>
                                <div class="image-overlay">
                                    <div class="image-content">
                                        <h1 class="featured-title">{{ blog.title }}</h1>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <!-- LEFT COLUMN - MAIN CONTENT -->
                            <div class="col-lg-8">
                                <!-- ARTICLE METADATA -->
                                <div class="article-metadata">
                                    <div class="meta-left">
                                        <div class="author-avatar-small">
                                            <i class="fa fa-user-circle"></i>
                                        </div>
                                        <div class="author-details">
                                            <p class="author-name">By {{ blog.author }}</p>
                                            <p class="publish-date">
                                                <i class="fa fa-calendar"></i> {{ formatDate(blog.created_at) }}
                                            </p>
                                        </div>
                                    </div>
                                    <div class="meta-right">
                                        <p class="share-label">Share:</p>
                                        <div class="social-share">
                                            <a href="https://www.facebook.com/profile.php?id=61560740824598" class="social-btn facebook" title="Facebook">
                                                <i class="fab fa-facebook-f"></i>
                                            </a>

                                            <a href="https://www.instagram.com/autours_/" class="social-btn pinterest" title="Instgram">
                                                <i class="fab fa-instagram"></i>
                                            </a>
                                            <a href="https://www.linkedin.com/company/autours/" class="social-btn linkedin" title="LinkedIn">
                                                <i class="fab fa-linkedin-in"></i>
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                <!-- ARTICLE TITLE & DIVIDER -->
                                <h2 class="article-main-title">{{ blog.title }}</h2>
                                <div class="title-divider"></div>

                                <!-- ARTICLE CONTENT -->
                                <article class="article-content">
                                    <div v-html="blog.content" class="content-text"></div>
                                </article>

                                <!-- AUTHOR BIO -->
                                <div class="author-bio-section">
                                    <div class="author-bio-avatar">
                                        <i class="fa fa-user-circle"></i>
                                    </div>
                                    <div class="author-bio-content">
                                        <h5>About Author</h5>
                                        <p>{{ blog.author }} is an expert contributor at Autours, sharing valuable insights about global destinations and car rental solutions.</p>
                                    </div>
                                </div>
                            </div>

                            <!-- RIGHT COLUMN - SIDEBAR -->
                            <div class="col-lg-4">
                                <!-- SEARCH WIDGET -->
                                <div class="sidebar-widget">
                                    <div class="search-box">
                                        <input type="text" placeholder="Search..." class="search-input">
                                        <button class="search-btn">
                                            <i class="fa fa-search"></i>
                                        </button>
                                    </div>
                                </div>

                                <!-- CATEGORIES WIDGET -->
                                <div class="sidebar-widget">
                                    <h5 class="widget-heading">Category</h5>
                                    <div class="categories-list">
                                        <a v-for="category in categories"
                                           :key="category.id"
                                           href="#"
                                           class="category-item"
                                           @click.prevent="navigateToCategory(category.id)">
                                            <span class="cat-bullet">•</span> {{ category.title }}
                                        </a>
                                    </div>
                                </div>

                                <!-- RELATED POSTS WIDGET -->
                                <div class="sidebar-widget" v-if="relatedBlogs.length > 0">
                                    <h5 class="widget-heading">Related Articles</h5>
                                    <div class="related-list">
                                        <div v-for="related in relatedBlogs.slice(0, 5)"
                                             :key="related.id"
                                             class="related-item"
                                             @click="openBlog(related.slug)">
                                            <p class="related-title">{{ related.title }}</p>
                                            <span class="related-meta">{{ formatDate(related.created_at) }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- RELATED ARTICLES CAROUSEL -->
                <section class="related-carousel-section" v-if="relatedBlogs.length > 0">
                    <div class="container-lg">
                        <div class="carousel-header">
                            <h3 class="carousel-title">You May Also Like</h3>
                            <div class="carousel-controls">
                                <button class="carousel-btn prev" @click="scrollCarousel('left')">
                                    <i class="fa fa-chevron-left"></i>
                                </button>
                                <button class="carousel-btn next" @click="scrollCarousel('right')">
                                    <i class="fa fa-chevron-right"></i>
                                </button>
                            </div>
                        </div>

                        <div class="carousel-wrapper">
                            <div ref="carouselContainer" class="carousel-container">
                                <div v-for="related in relatedBlogs.slice(0, 6)"
                                     :key="related.id"
                                     class="carousel-card"
                                     @click="openBlog(related.slug)">
                                    <div class="carousel-image">
                                        <img v-if="related.image"
                                             :src="`/img/blogs/${related.image}`"
                                             :alt="related.title"
                                             loading="lazy"/>
                                        <div v-else class="image-placeholder">
                                            <i class="fa fa-newspaper-o"></i>
                                        </div>
                                        <div class="image-overlay">
                                            <button class="play-btn">
                                                <i class="fa fa-arrow-right"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div class="carousel-content">
                                        <h5 class="carousel-card-title">{{ related.title }}</h5>
                                        <p class="carousel-card-meta">
                                            <i class="fa fa-calendar"></i> {{ formatDate(related.created_at) }}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <!-- NOT FOUND STATE -->
            <div v-else class="not-found-section">
                <div class="container text-center py-5">
                    <i class="fa fa-file-o"></i>
                    <h3>Article Not Found</h3>
                    <p>The article you're looking for doesn't exist or has been removed.</p>
                    <a href="/blogs" class="btn btn-primary">Go Back to Blog</a>
                </div>
            </div>
        </div>
        <!-- content close -->

        <!-- footer begin -->
        <!-- footer close -->
    </div>
    <footer-one/>

</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { usePage } from '@inertiajs/vue3'
import axios from 'axios'
import HeaderOne from '@/components/HeaderOne.vue'
import FooterOne from '@/components/Footer.vue'

const page = usePage()

const blog = ref(null)
const allBlogs = ref([])
const categories = ref([])
const loading = ref(true)
const carouselContainer = ref(null)

// ... define functions first ...
const formatDate = (date) => {
    if (!date) return 'Unknown'
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
}

const getExcerpt = (content, length = 80) => {
    if (!content) return 'No description available'
    const text = content.replace(/<[^>]*>/g, '')
    return text.length > length ? text.substring(0, length) + '...' : text
}

const fetchBlog = async () => {
    if (!blogSlug.value) {
        console.error('Blog slug not found', {
            ziggyParams: page.props.ziggy?.params,
            pathname: window.location.pathname
        })
        loading.value = false
        return
    }

    try {
        console.log('Fetching blog with slug:', blogSlug.value)
        const res = await axios.get(`/api/blogs/slug/${blogSlug.value}`)
        if (res.data.success) {
            blog.value = res.data.data
            console.log('Blog fetched successfully:', blog.value)
        } else {
            console.error('API returned success: false', res.data)
        }
    } catch (error) {
        console.error('Error fetching blog:', error)
        blog.value = null
    } finally {
        loading.value = false
    }
}

const fetchAllBlogs = async () => {
    try {
        const res = await axios.get('/api/blogs')
        if (res.data.success) {
            allBlogs.value = res.data.data.data || res.data.data
        }
    } catch (error) {
        console.error('Error fetching blogs:', error)
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

const openBlog = (slug) => {
    window.location.href = `/blogs/${slug}`
}

const navigateToCategory = (categoryId) => {
    window.location.href = `/blogs?category=${categoryId}`
}

const scrollCarousel = (direction) => {
    if (!carouselContainer.value) return
    const scrollAmount = 350
    if (direction === 'left') {
        carouselContainer.value.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
    } else {
        carouselContainer.value.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
}

// Get blog slug from route params - try multiple approaches
const blogSlug = computed(() => {
    // Try ziggy params first
    if (page.props.ziggy?.params?.slug) {
        return page.props.ziggy.params.slug
    }

    // Try from URL directly
    const urlParts = window.location.pathname.split('/')
    const slug = urlParts[urlParts.length - 1]
    if (slug && slug !== '' && slug !== 'blogs') {
        return slug
    }

    return null
})

// Watch for blog slug changes and fetch when it's available (NOW fetchBlog is defined)
watch(() => blogSlug.value, (newSlug) => {
    if (newSlug) {
        fetchBlog()
    }
}, { immediate: true })

const relatedBlogs = computed(() => {
    if (!blog.value) return []
    return allBlogs.value.filter(b =>
        b.id !== blog.value.id &&
        b.blog_category_id === blog.value.blog_category_id &&
        b.is_published
    )
})

onMounted(async () => {
    await Promise.all([
        fetchAllBlogs(),
        fetchCategories()
    ])

    // Fetch blog if slug is available
    if (blogSlug.value) {
        await fetchBlog()
    } else {
        loading.value = false
    }
})
</script>

<style scoped>
:root {
    --primary-color: #1ab394;
    --text-dark: #2c2c2c;
    --text-light: #666666;
    --border-color: #e5e5e5;
    --bg-light: #f9f9f9;
}

/* FEATURED IMAGE SECTION */
.blog-featured-section {
    position: relative;
    height: 450px;
    overflow: hidden;
    background: #f0f0f0;
}

.featured-image-wrapper {
    margin-bottom: 50px;
    margin-top: 100px;
    width: 100%;
}

.featured-container {
    position: relative;
    height: 400px;
    overflow: hidden;
    border-radius: 12px;
    background: #f0f0f0;
}

.featured-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.image-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: flex-end;
}

.image-content {
    width: 100%;
    padding: 40px;
    color: white;
}

.featured-title {
    font-size: 2.5rem;
    font-weight: 700;
    margin: 0;
    line-height: 1.3;
}

/* CONTENT SECTION */
.blog-content-section {
    background: white;
    padding: 60px 0;
}

/* ARTICLE METADATA */
.article-metadata {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30px 0;
    border-bottom: 1px solid var(--border-color);
    margin-bottom: 30px;
}

.meta-left {
    display: flex;
    align-items: center;
    gap: 15px;
}

.author-avatar-small {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: var(--bg-light);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.8rem;
    color: var(--primary-color);
}

.author-details p {
    margin: 0;
    padding: 2px 0;
    font-size: 0.9rem;
}

.author-name {
    font-weight: 700;
    color: var(--text-dark);
}

.publish-date {
    color: var(--text-light);
    display: flex;
    align-items: center;
    gap: 6px;
}

.publish-date i {
    font-size: 0.85rem;
}

.meta-right {
    display: flex;
    align-items: center;
    gap: 12px;
}

.share-label {
    margin: 0;
    font-weight: 600;
    color: var(--text-dark);
    font-size: 0.95rem;
}

.social-share {
    display: flex;
    gap: 10px;
}

.social-btn {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    color: white;
    font-size: 0.9rem;
    transition: all 0.3s ease;
    text-decoration: none;
}

.social-btn.facebook {
    background: #3b5998;
}

.social-btn.whatsapp {
    background: #25d366;
}

.social-btn.pinterest {
    background: #e60023;
}

.social-btn.linkedin {
    background: #0077b5;
}

.social-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* ARTICLE TITLE */
.article-main-title {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--text-dark);
    margin: 0 0 20px 0;
    line-height: 1.3;
}

.title-divider {
    height: 3px;
    width: 50px;
    background: var(--primary-color);
    margin-bottom: 30px;
}

/* ARTICLE CONTENT */
.article-content {
    margin: 30px 0;
}

.content-text {
    font-size: 1rem;
    line-height: 1.8;
    color: var(--text-light);
}

.content-text :deep(p) {
    margin-bottom: 20px;
}

.content-text :deep(h2) {
    font-size: 1.6rem;
    font-weight: 700;
    color: var(--text-dark);
    margin: 40px 0 20px 0;
}

.content-text :deep(h3) {
    font-size: 1.3rem;
    font-weight: 600;
    color: var(--text-dark);
    margin: 30px 0 15px 0;
}

.content-text :deep(ul),
.content-text :deep(ol) {
    margin: 20px 0 20px 25px;
}

.content-text :deep(li) {
    margin-bottom: 10px;
}

.content-text :deep(img) {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    margin: 25px 0;
}

.content-text :deep(a) {
    color: var(--primary-color);
    text-decoration: none;
    font-weight: 600;
}

.content-text :deep(a:hover) {
    text-decoration: underline;
}

/* AUTHOR BIO */
.author-bio-section {
    display: flex;
    gap: 20px;
    padding: 30px;
    background: var(--bg-light);
    border-radius: 8px;
    margin-top: 50px;
}

.author-bio-avatar {
    flex-shrink: 0;
    font-size: 3rem;
    color: var(--primary-color);
}

.author-bio-content {
    flex: 1;
}

.author-bio-content h5 {
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--text-dark);
    margin: 0 0 8px 0;
}

.author-bio-content p {
    font-size: 0.9rem;
    color: var(--text-light);
    line-height: 1.6;
    margin: 0;
}

/* SIDEBAR */
.sidebar-widget {
    background: white;
    padding: 25px;
    margin-bottom: 25px;
    border-radius: 8px;
    border: 1px solid var(--border-color);
}

.widget-heading {
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--text-dark);
    margin: 0 0 20px 0;
    padding-bottom: 12px;
    border-bottom: 2px solid var(--primary-color);
}

/* SEARCH BOX */
.search-box {
    display: flex;
    gap: 0;
}

.search-input {
    flex: 1;
    padding: 10px 15px;
    border: 1px solid var(--border-color);
    border-radius: 6px 0 0 6px;
    font-size: 0.9rem;
}

.search-btn {
    padding: 10px 15px;
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: 0 6px 6px 0;
    cursor: pointer;
    transition: background 0.3s ease;
}

.search-btn:hover {
    background: #0d8659;
}

/* CATEGORIES */
.categories-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.category-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 0;
    color: var(--text-light);
    text-decoration: none;
    font-size: 0.95rem;
    transition: all 0.3s ease;
    border-bottom: 1px solid var(--border-color);
}

.category-item:last-child {
    border-bottom: none;
}

.category-item:hover {
    color: var(--primary-color);
    padding-left: 5px;
}

.cat-bullet {
    color: var(--primary-color);
    font-weight: bold;
}

/* RELATED POSTS */
.related-list {
    display: flex;
    flex-direction: column;
    gap: 0;
}

.related-item {
    padding: 15px 0;
    border-bottom: 1px solid var(--border-color);
    cursor: pointer;
    transition: all 0.3s ease;
}

.related-item:last-child {
    border-bottom: none;
}

.related-item:hover {
    padding-left: 5px;
}

.related-title {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-dark);
    margin: 0 0 5px 0;
    line-height: 1.3;
}

.related-meta {
    font-size: 0.8rem;
    color: var(--text-light);
}

/* RELATED CAROUSEL SECTION */
.related-carousel-section {
    background: linear-gradient(135deg, #f0f9f7 0%, #f9f9f9 100%);
    padding: 80px 0;
    border-top: 2px solid var(--border-color);
}

.carousel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 40px;
}

.carousel-title {
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-dark);
    margin: 0;
}

.carousel-controls {
    display: flex;
    gap: 10px;
}

.carousel-btn {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border: 2px solid var(--primary-color);
    background: white;
    color: var(--primary-color);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
    transition: all 0.3s ease;
}

.carousel-btn:hover {
    background: var(--primary-color);
    color: white;
    transform: scale(1.05);
}

/* CAROUSEL WRAPPER */
.carousel-wrapper {
    position: relative;
    overflow: hidden;
}

.carousel-container {
    display: flex;
    gap: 25px;
    overflow-x: auto;
    scroll-behavior: smooth;
    padding: 20px 0;
    scroll-snap-type: x mandatory;
}

.carousel-container::-webkit-scrollbar {
    height: 6px;
}

.carousel-container::-webkit-scrollbar-track {
    background: #f0f0f0;
    border-radius: 10px;
}

.carousel-container::-webkit-scrollbar-thumb {
    background: var(--primary-color);
    border-radius: 10px;
}

.carousel-container::-webkit-scrollbar-thumb:hover {
    background: #0d8659;
}

/* CAROUSEL CARDS */
.carousel-card {
    flex: 0 0 280px;
    background: white;
    border-radius: 12px;
    overflow: hidden;
    cursor: pointer;
    scroll-snap-align: start;
    transition: all 0.3s ease;
    border: 1px solid var(--border-color);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.carousel-card:hover {
    box-shadow: 0 12px 28px rgba(26, 179, 148, 0.15);
    border-color: var(--primary-color);
    transform: translateY(-8px);
}

.carousel-image {
    position: relative;
    width: 100%;
    height: 200px;
    overflow: hidden;
    background: var(--bg-light);
}

.carousel-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s ease;
}

.carousel-card:hover .carousel-image img {
    transform: scale(1.1) rotate(1deg);
}

.image-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, var(--primary-color) 0%, #0d8659 100%);
    color: white;
    font-size: 2.5rem;
}

.image-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.carousel-card:hover .image-overlay {
    opacity: 1;
}

.play-btn {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    border: 2px solid white;
    background: transparent;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.3rem;
    transition: all 0.3s ease;
}

.play-btn:hover {
    background: var(--primary-color);
    border-color: var(--primary-color);
    transform: scale(1.1);
}

.carousel-content {
    padding: 18px;
}

.carousel-card-title {
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--text-dark);
    margin: 0 0 8px 0;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.carousel-card-meta {
    font-size: 0.8rem;
    color: var(--text-light);
    margin: 0;
    display: flex;
    align-items: center;
    gap: 5px;
}

.carousel-card-meta i {
    font-size: 0.75rem;
    color: var(--primary-color);
}

/* NOT FOUND */
.not-found-section {
    background: white;
    padding: 100px 40px;
    text-align: center;
}

.not-found-section i {
    font-size: 4rem;
    color: #ddd;
    margin-bottom: 20px;
}

.not-found-section h3 {
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--text-dark);
    margin: 0 0 15px 0;
}

.not-found-section p {
    color: var(--text-light);
    font-size: 1rem;
    margin: 0 0 30px 0;
}

.btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 30px;
    background: var(--primary-color);
    color: white;
    text-decoration: none;
    border-radius: 6px;
    font-weight: 700;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn:hover {
    background: #0d8659;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(26, 179, 148, 0.3);
}

/* RESPONSIVE */
@media (max-width: 768px) {
    .blog-featured-section {
        height: 300px;
    }

    .featured-title {
        font-size: 1.8rem;
    }

    .article-main-title {
        font-size: 1.8rem;
    }

    .article-metadata {
        flex-direction: column;
        gap: 20px;
        align-items: flex-start;
    }

    .section-heading {
        font-size: 1.5rem;
    }

    .card-image-wrapper {
        height: 180px;
    }
}

@media (max-width: 576px) {
    .blog-featured-section {
        height: 250px;
    }

    .featured-title {
        font-size: 1.5rem;
    }

    .article-main-title {
        font-size: 1.5rem;
    }

    .content-text {
        font-size: 0.95rem;
    }

    .meta-right {
        flex-direction: column;
        width: 100%;
        gap: 10px;
    }

    .social-share {
        width: 100%;
    }

    .section-heading {
        font-size: 1.3rem;
    }

    .card-image-wrapper {
        height: 150px;
    }
}

.hero-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.hero-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
}

.hero-content {
    position: absolute;
    bottom: 20px;
    left: 0;
    right: 0;
    padding: 30px 40px;
    color: white;
    z-index: 10;
}

.breadcrumb-hero {
    font-size: 0.95rem;
    opacity: 0.95;
    font-weight: 500;
}

.breadcrumb-hero a {
    color: white;
    text-decoration: none;
    transition: opacity 0.3s ease;
}

.breadcrumb-hero a:hover {
    opacity: 0.8;
    text-decoration: underline;
}

/* CONTENT WRAPPER */
.blog-content-wrapper {
    background: #ffffff;
    padding: 60px 0;
}

/* ARTICLE */
.article-main {
    background: #ffffff;
}

.article-header {
    margin-bottom: 40px;
    padding-bottom: 30px;
    border-bottom: 1px solid #e5e7eb;
}

.article-title {
    font-size: 3rem;
    font-weight: 800;
    color: #1f2937;
    line-height: 1.2;
    margin: 0 0 20px 0;
    word-wrap: break-word;
    word-break: break-word;
}

.article-meta {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    font-size: 0.95rem;
    color: #6b7280;
}

.meta-item {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #6b7280;
}

.meta-item i {
    color: #ffd100;
    font-size: 1rem;
}

.meta-separator {
    color: #d1d5db;
    font-weight: 300;
}

/* RESPONSIVE */
@media (max-width: 992px) {
    .article-title {
        font-size: 2.8rem;
    }

    .article-meta {
        gap: 15px;
    }

    .meta-item {
        padding: 10px 14px;
        font-size: 0.9rem;
    }

    .meta-item i {
        font-size: 1.1rem;
    }
}

@media (max-width: 768px) {
    .article-header {
        margin-bottom: 40px;
        padding-bottom: 30px;
    }

    .header-top {
        margin-bottom: 25px;
    }

    .article-title {
        font-size: 2rem;
    }

    .article-meta {
        gap: 12px;
        margin-top: 20px;
        padding-top: 20px;
    }

    .meta-item {
        padding: 8px 12px;
        font-size: 0.85rem;
    }

    .meta-item i {
        font-size: 1rem;
        width: 20px;
    }

    .article-divider {
        top: 35px;
    }
}

@media (max-width: 576px) {
    .article-header {
        margin-bottom: 30px;
        padding-bottom: 25px;
    }

    .header-top {
        margin-bottom: 20px;
    }

    .article-title {
        font-size: 1.5rem;
    }

    .article-meta {
        gap: 8px;
        margin-top: 15px;
        padding-top: 15px;
        flex-direction: column;
    }

    .meta-item {
        width: 100%;
        padding: 10px 12px;
        font-size: 0.8rem;
    }

    .meta-item i {
        font-size: 0.95rem;
    }

    .article-divider {
        top: 25px;
    }
}

.article-body {
    margin: 40px 0;
    padding: 30px 0;
    clear: both;
}

.content-text {
    font-size: 1.05rem;
    line-height: 1.85;
    color: #4b5563;
}

.content-text :deep(p) {
    margin-bottom: 20px;
}

.content-text :deep(h2) {
    font-size: 1.8rem;
    font-weight: 700;
    color: #000;
    margin: 40px 0 20px 0;
    padding-bottom: 12px;
    border-bottom: 2px solid #000;
}

.content-text :deep(h3) {
    font-size: 1.4rem;
    font-weight: 600;
    color: #000;
    margin: 30px 0 15px 0;
}

.content-text :deep(h4) {
    font-size: 1.2rem;
    font-weight: 600;
    color: #1f2937;
    margin: 25px 0 12px 0;
}

.content-text :deep(ul),
.content-text :deep(ol) {
    margin: 20px 0 20px 30px;
}

.content-text :deep(li) {
    margin-bottom: 12px;
    color: #4b5563;
}

.content-text :deep(blockquote) {
    border-left: 5px solid #000;
    padding: 20px 25px;
    margin: 25px 0;
    background: #fff8e1;
    border-radius: 6px;
    font-style: italic;
    color: #1f2937;
}

.content-text :deep(img) {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    margin: 30px 0;
    box-shadow: 0 4px 12px rgba(255, 209, 0, 0.15);
}

.content-text :deep(a) {
    color: blue;
    text-decoration: none;
    font-weight: 600;
    border-bottom: 2px solid transparent;
    transition: all 0.3s ease;
}

.content-text :deep(a:hover) {
    color: #f0c000;
    border-bottom-color: blue;
}

.content-text :deep(table) {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
}

.content-text :deep(th),
.content-text :deep(td) {
    border: 1px solid #e5e7eb;
    padding: 12px;
    text-align: left;
}

.content-text :deep(th) {
    background: #fff8e1;
    font-weight: 600;
}

/* ARTICLE FOOTER */
.article-footer {
    margin-top: 60px;
    padding-top: 40px;
    border-top: 1px solid #e5e7eb;
    clear: both;
}

.author-box {
    display: flex;
    gap: 20px;
    background: #f9fafb;
    padding: 24px;
    border-radius: 8px;
    border-left: 4px solid #ffd100;
}

.author-avatar {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 60px;
}

.author-avatar i {
    font-size: 3rem;
    color: #ffd100;
}

.author-info {
    flex: 1;
}

.author-info h5 {
    font-size: 1.05rem;
    font-weight: 700;
    color: #1f2937;
    margin: 0 0 8px 0;
}

.author-info p {
    font-size: 0.9rem;
    color: #6b7280;
    line-height: 1.6;
    margin: 0;
}

/* SIDEBAR WIDGETS */
.sidebar-widget {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 24px;
    margin-bottom: 25px;
    transition: border-color 0.3s ease;
}

.sidebar-widget:hover {
    border-color: #ffd100;
}

.widget-title {
    font-size: 1.05rem;
    font-weight: 700;
    color: #1f2937;
    margin: 0 0 18px 0;
    padding-bottom: 12px;
    border-bottom: 2px solid #ffd100;
    display: flex;
    align-items: center;
    gap: 8px;
}

.widget-title i {
    color: #ffd100;
    font-size: 1.1rem;
}

/* NAVIGATION LINKS */
.nav-links {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.nav-link {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 16px;
    background: #f3f4f6;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    color: #1f2937;
    text-decoration: none;
    font-weight: 600;
    font-size: 0.95rem;
    transition: all 0.3s ease;
    cursor: pointer;
}

.nav-link:hover {
    background: #ffd100;
    color: #333;
    border-color: #ffd100;
    transform: translateY(-2px);
}

/* CATEGORIES */
.categories-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.category-link {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 11px 14px;
    background: #f3f4f6;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    color: #1f2937;
    text-decoration: none;
    font-weight: 600;
    font-size: 0.9rem;
    transition: all 0.3s ease;
}

.category-link:hover {
    background: #ffd100;
    color: #333;
    border-color: #ffd100;
    transform: translateX(2px);
}

.category-link .count {
    background: #ffd100;
    color: #333;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 700;
    min-width: 35px;
    text-align: center;
}

.category-link:hover .count {
    background: white;
    color: #ffd100;
}

/* RELATED POSTS */
.related-posts-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.related-post {
    padding: 12px 14px;
    background: #f3f4f6;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.related-post:hover {
    background: #ffd100;
    border-color: #ffd100;
    transform: translateX(2px);
}

.related-post h6 {
    font-size: 0.9rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 5px 0;
    line-height: 1.3;
}

.related-post:hover h6 {
    color: #333;
}

.related-date {
    font-size: 0.8rem;
    color: #6b7280;
    font-weight: 500;
}

.related-post:hover .related-date {
    color: #333;
}

/* RELATED ARTICLES SECTION */
.related-articles-section {
    background: #f9fafb;
    padding: 80px 0;
    border-top: 1px solid #e5e7eb;
    margin-top: 60px;
}

.section-title {
    font-size: 2.2rem;
    font-weight: 800;
    color: #1f2937;
    text-align: center;
    margin: 0 0 50px 0;
    position: relative;
    padding-bottom: 20px;
}

.section-title::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 70px;
    height: 2px;
    background: #ffd100;
    border-radius: 2px;
}

.related-article-card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    overflow: hidden;
    transition: all 0.3s ease;
    cursor: pointer;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.related-article-card:hover {
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
    border-color: #ffd100;
    transform: translateY(-4px);
}

.card-image {
    width: 100%;
    height: 220px;
    overflow: hidden;
    background: #f0f0f0;
    position: relative;
}

.card-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
}

.related-article-card:hover .card-image img {
    transform: scale(1.05);
}

.placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #ffd100 0%, #f0c000 100%);
    color: white;
    font-size: 3rem;
}

.card-content {
    padding: 20px;
    flex: 1;
    display: flex;
    flex-direction: column;
}

.card-content h5 {
    font-size: 1rem;
    font-weight: 700;
    color: #1f2937;
    margin: 0 0 10px 0;
    line-height: 1.4;
}

.card-content p {
    font-size: 0.9rem;
    color: #6b7280;
    margin: 0 0 12px 0;
    line-height: 1.5;
    flex: 1;
}

.read-more {
    color: #ffd100;
    font-weight: 700;
    font-size: 0.9rem;
    transition: all 0.3s ease;
    display: inline-block;
}

.related-article-card:hover .read-more {
    color: #f0c000;
    transform: translateX(3px);
}

/* NOT FOUND SECTION */
.not-found-section {
    background: #ffffff;
    padding: 100px 40px;
    text-align: center;
}

.not-found-section i {
    font-size: 4rem;
    color: #e5e7eb;
    margin-bottom: 20px;
    display: block;
}

.not-found-section h3 {
    font-size: 1.8rem;
    font-weight: 700;
    color: #1f2937;
    margin: 0 0 15px 0;
}

.not-found-section p {
    color: #6b7280;
    margin: 0 0 30px 0;
    font-size: 1rem;
    line-height: 1.6;
}

.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 28px;
    background: #ffd100;
    color: #333;
    text-decoration: none;
    border-radius: 6px;
    font-weight: 700;
    font-size: 0.95rem;
    transition: all 0.3s ease;
    border: none;
    cursor: pointer;
}

.btn:hover {
    background: #f0c000;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 209, 0, 0.2);
}

/* RESPONSIVE */
@media (max-width: 992px) {
    .article-title {
        font-size: 2.2rem;
    }

    .article-meta {
        gap: 12px;
    }

    .meta-item {
        padding: 8px 12px;
        font-size: 0.85rem;
    }

    .author-box {
        flex-direction: column;
        gap: 15px;
    }

    .author-avatar {
        width: 50px;
        height: 50px;
    }

    .author-avatar i {
        font-size: 2.8rem;
    }

    .section-title {
        font-size: 1.8rem;
    }
}

@media (max-width: 768px) {
    .blog-hero-section {
        height: 300px;
        margin-bottom: 0;
    }

    .hero-content {
        padding: 20px 25px;
        bottom: 15px;
    }

    .breadcrumb-hero {
        font-size: 0.85rem;
    }

    .blog-content-wrapper {
        padding: 40px 0;
    }

    .article-header {
        margin-bottom: 35px;
        padding-bottom: 25px;
    }

    .article-title {
        font-size: 1.6rem;
        margin-bottom: 15px;
    }

    .article-meta {
        gap: 10px;
        flex-wrap: wrap;
    }

    .meta-item {
        padding: 7px 10px;
        font-size: 0.8rem;
    }

    .article-body {
        margin: 30px 0;
        padding: 20px 0;
    }

    .content-text {
        font-size: 1rem;
    }

    .content-text :deep(h2) {
        font-size: 1.4rem;
        margin: 30px 0 15px 0;
    }

    .content-text :deep(h3) {
        font-size: 1.2rem;
        margin: 20px 0 12px 0;
    }

    .sidebar-widget {
        padding: 20px;
        margin-bottom: 25px;
    }

    .widget-title {
        font-size: 1rem;
        margin-bottom: 15px;
    }

    .article-footer {
        margin-top: 40px;
        padding-top: 30px;
    }

    .author-box {
        padding: 20px;
    }

    .author-info h5 {
        font-size: 1rem;
    }

    .author-info p {
        font-size: 0.85rem;
    }

    .related-articles-section {
        padding: 60px 0;
        margin-top: 40px;
    }

    .section-title {
        font-size: 1.5rem;
        margin-bottom: 35px;
    }

    .card-image {
        height: 180px;
    }

    .card-content {
        padding: 15px;
    }
}

@media (max-width: 576px) {
    .blog-hero-section {
        height: 240px;
    }

    .hero-content {
        padding: 15px 15px;
        bottom: 10px;
    }

    .breadcrumb-hero {
        font-size: 0.75rem;
    }

    .article-title {
        font-size: 1.4rem;
        margin-bottom: 12px;
    }

    .article-meta {
        gap: 6px;
        flex-direction: column;
    }

    .meta-item {
        width: 100%;
        padding: 6px 10px;
        font-size: 0.75rem;
    }

    .article-body {
        margin: 20px 0;
        padding: 15px 0;
    }

    .content-text {
        font-size: 0.95rem;
    }

    .content-text :deep(h2) {
        font-size: 1.2rem;
    }

    .content-text :deep(h3) {
        font-size: 1rem;
    }

    .content-text :deep(blockquote) {
        padding: 12px 15px;
        margin: 15px 0;
    }

    .sidebar-widget {
        padding: 15px;
        margin-bottom: 20px;
    }

    .widget-title {
        font-size: 0.95rem;
        margin-bottom: 12px;
    }

    .nav-link {
        padding: 11px 14px;
        font-size: 0.9rem;
    }

    .related-article-card {
        border-radius: 6px;
    }

    .card-image {
        height: 150px;
    }

    .card-content {
        padding: 12px;
    }

    .section-title {
        font-size: 1.3rem;
        margin-bottom: 25px;
    }

    .not-found-section {
        padding: 60px 20px;
    }

    .not-found-section h3 {
        font-size: 1.5rem;
    }
}

/* RESPONSIVE */
@media (max-width: 992px) {
    .article-title {
        font-size: 2rem;
    }

    .article-meta {
        flex-direction: column;
        gap: 10px;
    }

    .author-box {
        flex-direction: column;
    }

    .section-title {
        font-size: 1.8rem;
    }
}

@media (max-width: 768px) {
    .blog-hero-section {
        height: 280px;
    }

    .hero-content {
        padding: 20px;
    }

    .article-title {
        font-size: 1.6rem;
    }

    .article-header {
        margin-bottom: 25px;
    }

    .content-text {
        font-size: 1rem;
    }

    .content-text :deep(h2) {
        font-size: 1.4rem;
    }

    .content-text :deep(h3) {
        font-size: 1.1rem;
    }

    .sidebar-widget {
        padding: 18px;
        margin-bottom: 20px;
    }

    .widget-title {
        font-size: 1rem;
        margin-bottom: 12px;
    }

    .author-box {
        padding: 18px;
    }

    .author-avatar i {
        font-size: 2.8rem;
    }

    .section-title {
        font-size: 1.5rem;
        margin-bottom: 30px;
    }

    .card-image {
        height: 160px;
    }

    .card-content {
        padding: 15px;
    }
}

@media (max-width: 576px) {
    .blog-hero-section {
        height: 220px;
    }

    .hero-content {
        padding: 15px;
    }

    .breadcrumb-hero {
        font-size: 0.85rem;
    }

    .article-title {
        font-size: 1.4rem;
    }

    .article-meta {
        gap: 8px;
    }

    .meta-item {
        font-size: 0.8rem;
        padding: 6px 10px;
    }

    .content-text :deep(blockquote) {
        padding: 12px 15px;
    }

    .related-article-card {
        border-radius: 6px;
    }

    .card-image {
        height: 140px;
    }

    .section-title {
        font-size: 1.3rem;
    }

    .not-found-section {
        padding: 60px 20px;
    }

    .not-found-section h3 {
        font-size: 1.5rem;
    }
}
</style>
