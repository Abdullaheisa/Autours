<template>
    <header-one/>

    <div>
        <!-- content begin -->
        <section class="no-bottom no-top manage-bg">
            <div id="top"></div>

            <!-- section begin -->
            <div id="" class="" style="height: 50px;">

            </div>
            <!-- section close -->

            <section aria-label="section">
                <div class="container">
                    <div class="row justify-content-center">

                        <!-- SUPPLIER NOTICE -->
                        <div v-if="RegisterForm.user_type === 'supplier'"
                             class="col-12 col-md-5 mt-4 supplier-notice">

                            <p>
                                Become a car rental supplier!
                                Autours is a company operating in the tourism field since its establishment in
                                2005, with car rental bookings being our main area of expertise.
                                We provide you a great chance to increase the business, as through our
                                multilingual www.autours.net millions of customers from different countries book
                                their car rental. We have a huge affiliate and reseller network worldwide, who
                                send us high amount of car bookings in different countries and destinations. It
                                is an opportunity for you to expand your business in different markets.
                                If you are a car rental company, small or big, and you want to increase the
                                volume of your car rental reservations, you are welcome to join our car rental
                                partner network.
                                Benefits from joining the car rental network of www.autours.net
                                No financial risk at all. The customers pay directly to you upon the arrival.
                                Immediate increase of your car rental sales.
                                No entry/administration fee or other costs.
                                Access to our agent area for special offers, stop sales, statistics, information
                                and evaluation results from customers. The results from the feedback and
                                evaluation will help you and improve your service.
                                Smart reservation procedure for confirming via e-mail or Dashboard for your
                                admin interface.
                                Flexible system for amendments, cancellations and one-way rentals.
                                Guaranteed bookings and very low volume of no-show customers
                                Our team will assist you, proposing rates, car groups purchase, changes and
                                tips.
                                Please fill in the Supplier Application Form in order to get more information on
                                how you can become an www.autours.net Supplier.
                            </p>
                        </div>

                        <!-- FORM -->
                        <div class="col-12 col-md-6">
                            <div class="flip-container">

                                <div v-if="!showForgetPassword"
                                     :class="RegisterForm.supplier ? 'flipper flip' : 'flipper'" id="flipper">
                                    <!-- FRONT (LOGIN) -->
                                    <div class="front">
                                        <h3 class="form-title">Manage Booking</h3>

                                        <form class="form-border" @submit.prevent="manageBooking">

                                            <div class="mb-3">
                                                <input placeholder="E-mail"
                                                       v-model="loginForm.email"
                                                       type="email"
                                                       class="input-text"/>
                                            </div>

                                            <div class="mb-3">
                                                <input v-model="loginForm.password"
                                                       type="password"
                                                       placeholder="Password"
                                                       class="input-text"/>
                                            </div>

                                            <div class="mt-4">
                                                <button type="submit"
                                                        class="btn-main color-2 rounded-5 w-100"
                                                        :disabled="loading">
                                                    LOGIN
                                                    <span><i class="fa fa-arrow-right ml-2"></i></span>
                                                </button>
                                            </div>

                                            <div class="text-center mt-3">
                                                <a class="flipbutton d-block"
                                                   @click="createAccount()">
                                                    Create my account →
                                                </a>
                                            </div>

                                            <div class="text-center mt-2">
                                                <a class="flipbutton d-block"
                                                   @click="forgetPassword()">
                                                    Forgot Your Password ?
                                                </a>
                                            </div>

                                        </form>
                                    </div>

                                    <!-- BACK (REGISTER) -->
                                    <div class="back">
                                        <h3 class="title my-3 text-center">Register</h3>

                                        <form class="form-border"
                                              autocomplete="off"
                                              @submit.prevent="postUserData">

                                            <div class="row">

                                                <div class="col-12 col-md-6 mb-3">
                                                    <input v-model="RegisterForm.name"
                                                           type="text"
                                                           placeholder="Full name"
                                                           class="input-text"/>
                                                </div>

                                                <div class="col-12 col-md-6 mb-3">
                                                    <input v-model="RegisterForm.email"
                                                           type="email"
                                                           placeholder="E-mail"
                                                           class="input-text"/>
                                                </div>

                                                <div class="col-12 mb-3">
                                                    <input v-model="RegisterForm.country"
                                                           type="text"
                                                           placeholder="Country"
                                                           class="input-text"/>
                                                </div>

                                                <div class="col-4 mb-3">
                                                    <input v-model="RegisterForm.code"
                                                           type="text"
                                                           placeholder="+20"
                                                           class="input-text"/>
                                                </div>

                                                <div class="col-8 mb-3">
                                                    <input v-model="RegisterForm.phone"
                                                           type="text"
                                                           placeholder="Phone number"
                                                           class="input-text"/>
                                                </div>

                                                <div class="col-12 mb-3">
                                                    <input v-model="RegisterForm.password"
                                                           type="password"
                                                           placeholder="Password"
                                                           class="input-text"/>
                                                </div>

                                                <div class="col-12 mt-3">
                                                    <button type="submit"
                                                            class="btn-main color-2 rounded-5 w-100">
                                                        Register
                                                        <span><i class="fa fa-arrow-right ml-2"></i></span>
                                                    </button>
                                                </div>

                                                <div class="col-12 text-center mt-3">
                                                    <a class="flipbutton d-block"
                                                       @click="LoginToMyAccount()">
                                                        Manage My Booking →
                                                    </a>
                                                </div>

                                            </div>
                                        </form>
                                    </div>
                                </div>

                                <div v-if="showForgetPassword" class="forget-card">

                                    <h3 class="form-title text-center">Forget Password</h3>

                                    <div class="mb-3">
                                        <input placeholder="E-mail"
                                               class="input-text"
                                               v-model="forgetPasswordEmail"/>
                                    </div>

                                    <div class="mt-3">
                                        <button class="btn-main color-2 rounded-5 w-100"
                                                @click="sendForgetPasswordEmail">
                                            Submit
                                        </button>
                                    </div>

                                    <div class="text-center mt-3">
                                        <a class="flipbutton d-block"
                                           @click="backToLogin">
                                            ← Back to Login
                                        </a>
                                    </div>

                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </section>
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

const showForgetPassword = ref(false);

const RegisterForm = useForm({
    name: '',
    phone: '',
    email: '',
    country: '',
    password: '',
    user_type: '',
    code: '',
    supplier: 0
});

const loginForm = useForm({
    email: '',
    password: '',
});

const countries = {
    loading: ref(false),
    all: ref([]),
    list: ref([]),
    options: ref([]),
};
const $toast = useToast();
const fetchCountries = async () => {
    countries.loading.value = true;
    try {
        //
        const response = await axios.get('https://countriesnow.space/api/v0.1/countries', {})
        countries.all.value = response.data.data
        countries.list.value = countries.all.value.map((item) => ({
            id: `${item.id}`,
            label: `${item.country}`,
            iso: `${item.iso2}`
        }))
    } catch (error) {
        console.error(error)
    } finally {
        countries.loading.value = false;
    }
}
const forgetPasswordEmail = ref('')
const loading = ref(false);
const postUserData = async () => {
    loading.value = true

    if (RegisterForm.name === undefined || RegisterForm.name === null || RegisterForm.name.length === 0) {
        $toast.error("Please Insert valid Name", {position: 'top'});
        return;
    }
    if (RegisterForm.email === undefined || RegisterForm.email === null || RegisterForm.email.length === 0) {
        $toast.error("Please Insert valid Email", {position: 'top'});
        return;
    }
    if (RegisterForm.password === undefined || RegisterForm.password === null || RegisterForm.password.length === 0) {
        $toast.error("Please Insert valid Password", {position: 'top'});
        return;
    }
    try {

        const response = await axios.post('/post/user/data', RegisterForm.data())
        if (response.data.status) {
            $toast.success('You Have Successfully Registered', {position: 'top'})
            setTimeout(function () {
                window.location.href = '/'
            }, 1000)
        }
        loading.value = false

    } catch ($error) {
        loading.value = false
        $toast.error($error.response.data.message, {position: 'top'})
    }
};

const manageBooking = async () => {
    loading.value = true

    if (loginForm.email === undefined || loginForm.email === null || loginForm.email.length === 0) {
        $toast.error("Please Insert Email", {position: 'top'});
        return;
    }
    if (loginForm.password === undefined || loginForm.password === null || loginForm.password.length === 0) {
        $toast.error("Please Insert  Yor password", {position: 'top'});
        return;
    }
    try {
        const response = await axios.post('/login', loginForm.data())
        if (response.data.status) {
            $toast.success('You Have Successfully Logged In', {position: 'top'})
            setTimeout(function () {
                console.log(response.data.children)
                if (response.data.user_type !== 'customer') {
                    if (response.data.children) {

                        window.location.href = '/select-company'
                        return;
                    }
                    window.location.href = '/index'
                } else {
                    window.location.href = '/'
                }
            }, 1000)
        }
    } catch ($error) {
        loading.value = false
        $toast.error($error.response.data.message, {position: 'top'})
    }
};
const forgetPassword = () => {
    showForgetPassword.value = true;
};

const backToLogin = () => {
    showForgetPassword.value = false;
};
const createAccount = () => {
    document.querySelector("#flipper").classList.toggle("flip");
}


const LoginToMyAccount = () => {
    document.querySelector("#flipper").classList.toggle("flip");

}
const getUserData = async () => {
    try {
        const response = await axios.get('/get/user/data');
        if (response.data) {
            router.get('/')
        }
    } catch (error) {
        console.error(error);
    }
}
const sendForgetPasswordEmail = async () => {
    try {
        const response = await axios.post('/forget-password', {email: forgetPasswordEmail.value});
        $toast.success("Email Sent Successfully to reset password", {position: "top"});
        router.get('/')

    } catch (e) {
        $toast.error("Something went wrong")
        console.log(e)
    }
}
onBeforeMount(() => {
    getUserData();

})
onMounted(() => {

    let urlParams = new URLSearchParams(window.location.search);
    fetchCountries()
    RegisterForm.user_type = urlParams.get('user_type');
    if (RegisterForm.user_type == 'supplier') {
        console.log(RegisterForm.supplier)
        RegisterForm.supplier = 1;
        console.log(RegisterForm.supplier)

    }
})
</script>

<style scoped>
.manage-bg {
    width: 100%;
    background-image: url('/images/background/manage-booking-div.jpg');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
}

html, body {
    overflow-x: hidden;
}

/* FLIP CARD */
.flip-container {
    perspective: 1000px;
}

.flipper {
    position: relative;
    width: 100%;
    max-width: 1000px;
    margin: auto;
    min-height: 550px;
    padding: 30px;
    background-image: url('/images/background/manage-booking-form.png');
    background-size: cover;
    background-repeat: no-repeat;
    border-radius: 20px;
    transition: 0.6s;
    transform-style: preserve-3d;
}

.front {
    position: absolute;
    top: 70px;
    left: 0;
    right: 0;
    padding: 20px;
    backface-visibility: hidden;
    transform: rotateY(0deg);
    z-index: 2;
}

.back {
    position: absolute;
    top: 0px;
    left: 0;
    right: 0;
    padding: 20px;
    backface-visibility: hidden;
    transform: rotateY(180deg);
}

.flip {
    transform: rotateY(180deg);
}

/* FORM */
.form-title {
    text-align: center;
    font-weight: 700;
    margin-bottom: 20px;
}

.input-text {
    width: 100%;
    height: 45px;
    padding: 10px 15px;
    border-radius: 50px !important;
    border: 3px solid black !important;
}

.flipbutton {
    color: #4096ee;
    cursor: pointer;
    text-decoration: none;
}

/* SUPPLIER NOTICE */
.supplier-notice {
    max-height: 420px;
    overflow-y: auto;
    padding: 20px;
}

/* MOBILE */
@media (max-width: 768px) {

    .supplier-notice {
        max-height: 280px;
        margin-bottom: 20px;
    }

    .flipper {
        padding: 20px;
        min-height: auto;
    }

    .front {
        position: relative;
        padding: 10px;
        max-height: 250px;
    }

    .back {
        position: relative;
        padding: 10px;
        max-height: 450px;
        top: -200px;
    }

    .flip {
        transform: rotateY(180deg);
    }

    .btn-main {
        width: 100%;
    }

    .form-title {
        font-size: 20px;
    }
}

.forget-card {
    width: 100%;
    max-width: 500px;
    margin: auto;
    padding: 30px;
    background-image: url('/images/background/manage-booking-form.png');
    background-size: cover;
    background-repeat: no-repeat;
    border-radius: 20px;
}
</style>
