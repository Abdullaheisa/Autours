<template>
    <body>
    <div id="wrapper">

        <!-- header begin -->
        <header-one/>
        <!-- header close -->
        <!-- content begin -->
        <div class="no-bottom no-top zebra" id="content">
            <div id="top"></div>

            <div class="text-center col-12" style="margin-top: 100px;">
                <div class="mx-auto mb-2" style="background: #ffd100; height: 20px; width: 250px; position: absolute; left: 0; right: 0; top: 20px; z-index: -100;"></div>
                <h1 class="text-nowrap">Contact Us</h1>
            </div>
            <div class="contact-info row">
                <div class="col-lg-2 offset-1">
                    <div
                        class="my-3"
                        style="background-image: url('/assets/images/icons/whatsapp-icon.png');  width: 220px; height: 148px; justify-content: center; display: flex;">
                        <p style="color: gold; font-weight: bold; margin-top: 25%;">Message Us <br>+965 6048 0382</p>
                    </div>
                    <div
                        class="my-3"
                        style="background-image: url('/assets/images/icons/phone-icon.png');  width: 220px; height: 148px; justify-content: center; display: flex;">
                        <p style="color: gold; font-weight: bold; margin-top: 25%;">
                            Call Us <br> +965 6048 0382
                        </p>
                    </div>
                    <div
                        style="background-image: url('/assets/images/icons/Email-icom.png');  width: 220px; height: 148px; justify-content: center; display: flex;">
                        <a href="mailto:admin@info.net" style="color: gold; font-weight: bold; margin-top: 25%; "
                           target="_blank">

                            <p>
                                Email Us <br>Info@autours.net
                            </p>
                        </a>
                    </div>
                </div>


                <!-- Contact Form -->
                <div class="col-lg-6 col-md-8 mt-3">
                    <h2 class="mb-4">Get in Touch</h2>
                    <form class="row g-3">
                        <div class="col-md-6">
                            <input type="text" class="form-control contact_form" placeholder="First Name" required />
                        </div>
                        <div class="col-md-6">
                            <input type="text" class="form-control contact_form" placeholder="Last Name" required />
                        </div>
                        <div class="col-md-6">
                            <input type="email" class="form-control contact_form" placeholder="E-mail Address" required />
                        </div>
                        <div class="col-md-6">
                            <input type="tel" class="form-control contact_form" placeholder="Phone Number" required />
                        </div>
                        <div class="col-12">
                            <textarea class="form-control contact_form" placeholder="Message..." rows="5" required v-model="form.message"></textarea>
                        </div>
                        <div class="col-12 col-md-3 ">
                            <button type="submit" class="btn btn-primary text-black p-3 mt-2 w-100" @click.prevent>SUBMIT</button>
                        </div>
                    </form>

                    <!-- Social Links -->
                    <div class="d-flex justify-content-center flex-wrap my-4">
                        <a target="_blank" href="https://www.facebook.com/profile.php?id=61560740824598" class="mx-3">
                            <img width="30" src="/assets/images/icons/f.png" alt="Facebook" />
                        </a>
                        <a target="_blank" href="https://www.instagram.com/autours_/" class="mx-3">
                            <img width="40" src="/assets/images/icons/n.png" alt="Instagram" />
                        </a>
                        <a target="_blank" href="https://x.com/Autours_" class="mx-3">
                            <img width="40" src="/assets/images/icons/x.png" alt="Twitter" />
                        </a>
                        <a target="_blank" href="#" class="mx-3">
                            <img width="40" src="/assets/images/icons/t.png" alt="TikTok" />
                        </a>
                        <a target="_blank" href="https://www.linkedin.com/company/autours/" class="mx-3">
                            <img width="40" src="/assets/images/icons/in.png" alt="LinkedIn" />
                        </a>
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
import Editor from 'primevue/editor';

const form = {
    first_name: ref(""),
    last_name: ref(""),
    email: ref(""),
    mobile: ref(""),
    description: ref(""),
}

onMounted(() => {

})

</script>

<style scoped>

.contact-box {
    height: 250px;
    width: 60%;
    background-size: cover;
    background-position: center;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    text-align: center;
    border-radius: 8px;
}
.text-gold {
    color: gold;
}
div.contact-info {
    background-color: #fff5a9;
    padding: 20px;
    text-align: center;
}

section.contact-info div {
    margin: 10px 0;
}

form {
    text-align: center;
    padding: 20px;
}

form input, form textarea {
    margin: 5px;
    padding: 10px;
    width: 80%;
    max-width: 400px;
}


footer {
    text-align: center;
    padding: 20px;
}

footer img {
    width: 30px;
    margin: 0 10px;
}

#map {
    width: 100%;
    height: 300px;
}

#top {
    margin-top: 8%;

}

.contact_form {
    background: rgb(255, 229, 140);
    border-radius: 30px;
}

input::placeholder,
textarea::placeholder {
    margin-left: 50px;
    color: #000000; /* Change to your preferred color */
    opacity: 1; /* Ensures the placeholder is fully opaque */
}
</style>
