<template>
    <header-one/>

    <div id="wrapper">
        <!-- content begin -->
        <div class="no-bottom no-top" id="content"
             style="background-image: url('/images/background/manage-booking-div.jpg')">
            <div id="top"></div>
            <!-- section begin -->
            <section id="subheader" class="jarallax ">
                <div class="center-y relative text-center">
                    <div class="container">
                        <div class="row">
                            <div class="col-md-12 text-center">
                                <!--                                <h2>View / Manage Booking</h2>-->
                            </div>
                            <div class="clearfix"></div>
                        </div>
                    </div>
                </div>
            </section>
            <!-- section close -->
            <section aria-label="section">
                <div class=" col-md-6 flip-container">
                    <div id="forgetPassword" class="flipper  offset-6">
                        <div class="front">
                            <p style="font-size: 50px; margin-top: 5%; margin-left: 25%; font-weight: 1000;">
                                New Password</p>
                            <form class="mt-5">
                                <div class="col-md-8" style="left: 15%">
                                    <input placeholder="New Password" type="password" class="input-text mt-4"
                                           v-model="newPassword"/>
                                    <input placeholder="Confirm New Password" type="password" class="input-text mt-4"
                                           v-model="confirmPassword"/>
                                </div>
                                <a style="left: 40%;" class="btn-main mt-4  rounded-5"
                                   @click="sendNewPassword()">Submit</a>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </div>
        <!-- content close -->
    </div>
    <Footer/>

</template>

<script setup>
import {router, useForm} from '@inertiajs/vue3';
import {ref} from 'vue';
import HeaderOne from "../../components/HeaderOne.vue";
import {useToast} from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';
import Footer from "../../components/Footer.vue"
import Contactus from "../../components/Contactus.vue"
import {onMounted, onBeforeMount} from 'vue'

const $toast = useToast();
const newPassword = ref('')
const confirmPassword = ref('')
const key = ref('')

const sendNewPassword = async () => {
    try {
        const formData = new FormData()
        formData.set('newPassword', newPassword.value)
        formData.set('confirmPassword', confirmPassword.value)
        formData.set('key', key.value)
        const response = await axios.post('/save-new-password', formData);
        if (response.data.status) {
            $toast.success('password has been reset successfully!', {position: "top"});
            router.get('/')
        }

    } catch (e) {
        console.log(e)
    }
}
const validateKey = async () => {
    try {
        const formData = new FormData()
        formData.set('key', key.value)
        const response = await axios.post('/validate-forget-password-key', formData);
        if (response.data.status) {
            console.log("validated")
        }
    } catch (e) {
        console.log(e)
        router.get('/')
    }
}

onMounted(() => {

    let urlParams = new URLSearchParams(window.location.search);
    key.value = urlParams.get('key');
    validateKey()


})
</script>

<style scoped>


#subheader h3, h2 {
    font-family: 'Outfit';
    margin-top: 100px;
    margin-bottom: 10px;
    letter-spacing: -2px;
}


.flipper {
    padding: 30px;
    width: 95%;
    left: 5%;
    height: 450px;
    position: relative;
    background-image: url('/images/background/manage-booking-form.png');
    background-repeat: no-repeat;
    -webkit-border-radius: 20px;
    -moz-border-radius: 20px;
    border-radius: 20px;

    transition: 0.6s;
    transform-style: preserve-3d;
}

.front, .back {
    /*background-color: rgba(0,0,0,.3);*/
    position: absolute;
    padding: 10px 30px;

    top: 0;
    left: 0;
    right: 0;

    backface-visibility: hidden;
}

.front {

    z-index: 2;
    /* for firefox 31 */
    transform: rotateY(0deg);
}

.back {
    transform: rotateY(180deg);
}

.flip {
    transform: rotateY(180deg);
}

input {
    width: 100%;
    margin-bottom: 15px;
    height: 40px;
    box-sizing: border-box;
    padding: 10px;
}

.title {
    text-align: center;
}

.flipbutton {
    color: #4096ee;
    text-decoration: none;
    text-align: left !important;
}

@media screen and (max-width: 1000px) {

    .flip-container {
        width: 100%;

    }

    .flipper {
        top: -120px;
        width: 100%;
        left: 0;
        background: #ffffff;
    }
}

.input-text {
    border-radius: 50px !important;
    border-width: 3px !important;
    border-color: black !important;
}

.register-form {
    background-image: url('/images/background/manage-booking-form.png');
    background-repeat: no-repeat;
}
</style>
