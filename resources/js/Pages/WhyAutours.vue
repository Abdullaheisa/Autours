<template>
    <body>
    <div id="wrapper">

        <!-- header begin -->
        <header-one/>
        <!-- header close -->
        <!-- content begin -->
        <div class="text-center" id="content">
            <div class=" mb-3">
               <img src="/images/why_autours/ttile.png">
            </div>
            <p style="font-size: 20px;" class="mx-5"> Whether you are a supplier looking to expand your reach or a
                renter of a vehicle, Autours is your trusted partner in the car rental market. Join us today and
                experience the Autours difference! </p>
            <img style="width: 100%" src="/images/why_autours_customer.jpg"/>
            <div class="row mt-5">
                <div class=" mb-3">
                    <img src="/images/why_autours/customers.png"/>
                </div>
                <div>
                    <div>
                        <p style="font-size: 25px">At Autours, we strive to provide an exceptional car rental experience
                            tailored to your needs. Hereís why choosing us is the right
                            decision:</p>
                    </div>


                    <div class="mb-5">
                        <div>
                            <img  src="/images/why_autours/drivers-fleet.png"/>
                        </div>
                        <div style="font-size: 20px;">
                            We offer a wide range of vehicles to suit any occasion, from compact cars for city driving
                            to
                            spacious SUVs for
                            family trips.<br> Whatever your needs, you’ll find the perfect vehicle with us.
                        </div>
                    </div>

                    <div class="mb-5">
                        <div  >
                            <img   src="/images/why_autours/pricing.png"/>
                        </div>
                        <div  style="font-size: 20px;">
                            Our transparent pricing model ensures you get the best value for your rental. With no hidden
                            fees and flexible
                            rental options,<br> we make it easy for you to find a deal that fits your budget
                        </div>
                    </div>

                    <div class="mb-5">
                        <div>
                            <img src="/images/why_autours/seamless.png"/>
                        </div>
                        <div style="font-size: 20px;">
                            Our system is designed for your convenience. With a straightforward booking process, you can
                            secure your
                            vehicle in just a few clicks.<br> Plus, our customer support team is always ready to assist
                            you with any inquiries.
                        </div>
                    </div>

                    <div class="mb-5">
                        <div>
                            <img src="/images/why_autours/felx.png"/>
                        </div>
                        <div style="font-size: 20px;">
                            Whether you need a car for a day, a week, or longer, Autours offers flexible rental periods
                            to accommodate your
                            schedule. <br>We understand that plans can change, so we provide easy options for modifications
                            and extensions.
                        </div>
                    </div>
                    <div class="mb-5">
                        <div class=" ">
                            <img src="/images/why_autours/quality.png"/>
                        </div>
                        <div style="font-size: 20px;">
                            All our vehicles undergo regular maintenance checks to ensure they meet the highest safety
                            and quality
                            standards. <br>You can drive with confidence knowing that your rented car is reliable and
                            well-maintained.
                        </div>
                    </div>
                    <div class="mb-5">
                        <div>
                            <img src="/images/why_autours/extra.png"/>
                        </div>
                        <div class="" style="font-size: 20px;">
                            Enjoy benefits like Free cancellation, Free amendments, and Instant confirmation when you
                            book with Autours,<br>
                            ensuring a hassle-free experience that adapts to your needs.
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
