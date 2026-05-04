<template>
    <body>
    <div id="wrapper">

        <!-- header begin -->
        <header-one/>
        <!-- header close -->
        <!-- content begin -->
        <div class="no-bottom no-top zebra" id="content">
            <div id="top"></div>
            <section id="section-car-details">
                <div class="container">
                    <!-- section begin -->
                    <div class="mt-5">
                        <h2>Bookings History </h2>
                    </div>
                    <hr/>
                </div>
                <div class="container">
                    <div class="" v-for="item in rentals">
                        <div>
                            <h4>
                                {{ item.vehicle.branch?.city }},&nbsp;{{ item.vehicle.branch?.country }}
                            </h4>
                            <small>{{ item.start_date + ' , ' + item.end_date }} </small>
                        </div>
                        <div class="card p-4 row shadow-2-strong flex-row" style="width: 90%">
                            <div class="col-md-2 ">
                                <img :src=" 'img/vehicles/' + item.vehicle.photo" width="180" height="100" alt=""/>
                            </div>
                            <div class="col-md-4">
                                    <div class="text-nowrap"><h5>{{ item.vehicle.name }}&nbsp;Or&nbsp;Similar </h5></div>
                                    <strong>{{ item.start_date + ' - ' + item.end_date }}</strong>
                                    <div class="row ">
                                        <img class="col-md-4 rounded-3" :src="'img/' + item.vehicle.supplier.logo"
                                             height="80" width="50">
                                        <p class="col-md-6 mt-4">{{ item.vehicle.supplier.name }}</p></div>
                                    <strong
                                        :style="item.order_status == 2 ? 'color: green': item.order_status == 3 ? 'color: red' :item.order_status == 4 ? 'color: yellow'  :'color: gray'">{{
                                            item.status.name_en
                                        }}</strong>
                            </div>
                            <div class="col-md-5">
                                <p class="row">
                                    <strong class="col-md-2 text-nowrap">Pick-up:</strong>
                                    <small class="col-md-10 text-nowrap">{{ item.vehicle.branch?.address }}</small>
                                    <strong class="col-md-2 text-nowrap">Drop-off:</strong>
                                    <small class="col-md-10 text-nowrap">{{ item.vehicle.branch?.address }}</small>
                                </p>
                                <p class="row"><strong class="col-md-5"> Total price:</strong><small class="col-md-4">
                                    {{ item.currency }}&nbsp;{{ item.price }}</small></p>
                            </div>
                            <div class="col-md-1" style="top: 0; right: 0;">
                                <CDropdown togglerText="Dropdown button" class="mt-1 dropdown">
                                    <CDropdownToggle component="a" style="color: rgba(30, 30, 30, 1);"><i
                                        class="fa fa-bars"/></CDropdownToggle>
                                    <CDropdownMenu>
                                        <CDropdownItem :disabled="loading" class="cursor-pointer" style="color: black;"
                                                       @click="bookAgain(item)"><i class="fa fa-repeat"/>&nbsp;Book&nbsp;again
                                        </CDropdownItem>
                                        <CDropdownItem :disabled="loading" class="cursor-pointer" style="color: black;"
                                                       ><i class="fa fa-download"/>&nbsp;Download&nbsp;invoice
                                        </CDropdownItem>

                                    </CDropdownMenu>
                                </CDropdown>
                            </div>

                            <button v-if="item.order_status != 3" :disabled="loading" class="offset-10 col-md-2 cursor-pointer btn btn-danger"
                                    @click="cancelBooking(item)"><i class="fa fa-cancel"/>&nbsp;Cancel
                            </button>
                        </div>
                        <hr/>
                    </div>
                </div>

            </section>
        </div>
    </div>

    <!-- content begin -->
    <Footer/>

    </body>
</template>
<script setup>
import {ref, onMounted} from 'vue'
import {router, useForm} from '@inertiajs/vue3';
import Loader from '../components/Loader.vue'
import Footer from "../components/Footer.vue";
import HeaderOne from "../components/HeaderOne.vue";
import getUnicodeFlagIcon from "country-flag-icons/unicode";
import {CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle} from "@coreui/vue";
import {useToast} from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';

const $toast = useToast();
const loading = ref(false)
const rentals = ref('');
const approveFare = ref(false)
const getRentals = async () => {
    try {
        loading.value = true

        const response = await axios.get('get/rentals')
        rentals.value = response.data
        loading.value = false
    } catch (error) {
        console.error(error)
    }
}

const bookAgain = (rental) => {
    try {
        const todayDate = new Date();
        const tomorrowDate = new Date();
        tomorrowDate.setDate(tomorrowDate.getDate() + 1);
        console.log(tomorrowDate)
        const form = {

            date_from: todayDate.getFullYear() + '-' + (todayDate.getMonth() < '10' ? '0' + todayDate.getMonth() : todayDate.getMonth()) + '-' + todayDate.getDate(),
            date_to: tomorrowDate.getFullYear() + '-' + (tomorrowDate.getMonth() < '10' ? '0' + tomorrowDate.getMonth() : tomorrowDate.getMonth()) + '-' + tomorrowDate.getDate(),
            time_from: "00:00",
            time_to: "00:00",
            pickupLoc: rental.vehicle.branch?.location,
            id: rental.vehicle.id
        }
        router.get('/vehicles/book', form)
    } catch (e) {

    }
}

const cancelBooking = async (rental) => {
    try {
        loading.value = true
        const response = await axios.post('/cancel/booking', rental);

        console.log(response.status)
        if (response.status) {
            $toast.warning('Rental has been Cancelled', {position: 'top'})
            getRentals()
        }
        loading.value = false
    } catch (e) {

        loading.value = false
        $toast.error(e.response.data.message, {position: 'top'})
    }

}

onMounted(() => {
    getRentals();
})


</script>
<style>
.card:hover {
    box-shadow: 5px 5px 50px 5px #d9d9d9;
}

.dropdown:hover {
    box-shadow: 5px 5px 50px 5px #eaeaea;
    border-radius: 10px

}

@media (max-width: 767px) {
    .card-body {
        flex-direction: column !important;
    }
}
</style>
