<template>
    <body>
    <div id="wrapper">

        <!-- header begin -->
        <header-one/>
        <!-- header close -->
        <!-- content begin -->
        <div class="no-bottom no-top zebra" id="content">
            <div id="top"></div>

            <!-- About Us Title -->
            <div class="text-center my-4">
                <div style="background:#ffd100; height: 4px; width: 80px; margin: 0 auto 10px;"></div>
                <h1 class="h2">About Us</h1>
            </div>

            <!-- About Text Section -->
            <div class="container mb-5">
                <div class="row justify-content-center">
                    <div class="col-lg-10 col-md-11">
                        <h3>
                            At Autours, we strive to empower companies to reach a wide range of customers.
                        </h3>
                        <p>
                            As a partner on our platform, we provide you with the opportunity to grow your business and
                            expand your reach to local and regional markets. We believe that collaboration is the key to mutual
                            growth, which is why we offer our partnered companies comprehensive tools and reports to help them
                            enhance their services and engage better with customers.
                        </p>
                        <p>
                            We are committed to providing a flexible and supportive business environment that contributes to the
                            success of our partnerships. With Autours, we are dedicated to offering opportunities for continuous
                            growth and development for car rental companies through our long-term partnerships.
                        </p>
                        <h3>
                            Join us today and be part of the future of the car rental industry in the region.
                        </h3>
                    </div>
                </div>
            </div>

            <!-- Background Car Image -->
            <div class="container-fluid px-0">
                <img src="/assets/images/backgrounds/car.png" alt="Car" class="img-fluid w-100" />
            </div>

            <!-- Why Choose Us -->
            <div class="container my-5">
                <h2 class="text-center mb-4">Why Choose Us</h2>
                <div class="row text-center justify-content-center">
                    <div class="col-6 col-sm-4 col-md-2 mb-4">
                        <img src="/assets/images/icons/car-icon.png" alt="All Brands" class="img-fluid mb-2" />
                        <h5>ALL BRANDS</h5>
                    </div>
                    <div class="col-6 col-sm-4 col-md-2 mb-4">
                        <img src="/assets/images/icons/team-icon.png" alt="Expert Team" class="img-fluid mb-2" />
                        <h5>EXPERT TEAM</h5>
                    </div>
                    <div class="col-6 col-sm-4 col-md-2 mb-4">
                        <img src="/assets/images/icons/24-h-icon.png" alt="24H Service" class="img-fluid mb-2" />
                        <h5>24 H SERVICE</h5>
                    </div>
                    <div class="col-6 col-sm-4 col-md-2 mb-4">
                        <img src="/assets/images/icons/AFFORDABLE-icon.png" alt="Affordable" class="img-fluid mb-2" />
                        <h5>AFFORDABLE</h5>
                    </div>
                    <div class="col-6 col-sm-4 col-md-2 mb-4">
                        <img src="/assets/images/icons/anywhere-icon.png" alt="Anywhere" class="img-fluid mb-2" />
                        <h5>ANY WHERE</h5>
                    </div>
                </div>
            </div>

            <!-- Vision & Goal Section -->
            <div class="container-fluid py-5" style="background: rgb(249, 214, 2)">
                <div class="container">
                    <div class="row">
                        <!-- Our Vision -->
                        <div class="col-md-6 mb-5">
                            <h2>Our Vision</h2>
                            <div class="row">
                                <div class="col-sm-6 mb-3">
                                    <img src="/assets/images/backgrounds/Our-Goals.png" class="img-fluid" />
                                </div>
                                <div class="col-sm-6">
                                    <p>
                                        To be the preferred partner for car rental companies in the region by providing an innovative
                                        platform that supports their growth and expansion while enhancing their ability to deliver the
                                        best customer service.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <!-- Our Goal -->
                        <div class="col-md-6 mb-5">
                            <h2>Our Goal</h2>
                            <div class="row">
                                <div class="col-sm-6 mb-3">
                                    <img src="/assets/images/backgrounds/Our-Vision.png" class="img-fluid" />
                                </div>
                                <div class="col-sm-6">
                                    <p>
                                        Support companies in reaching new markets through our platform. Provide analytical tools and
                                        reports to help companies improve their performance. Strengthen collaboration between Autours
                                        and its partners to ensure a smooth and successful rental experience. Achieve sustainable growth
                                        for partnered companies through transparency and continuous development.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <Footer/>

    </body>
</template>

<script setup>
import {ref, onMounted} from 'vue'
import 'vue-toast-notification/dist/theme-sugar.css';
import HeaderOne from '../components/HeaderOne.vue'
import Footer from "../components/Footer.vue";
import 'primevue/resources/themes/aura-light-amber/theme.css'


onMounted(() => {

})

</script>

<style scoped>
#top {
    margin-top: 7%;
}
</style>
