<template>
    <body>
    <div id="wrapper">

        <!-- header begin -->
        <header-one/>
        <!-- header close -->
        <!-- content begin -->
        <div class="no-bottom no-top zebra" id="content">
            <div id="top"></div>

            <!-- section begin -->


            <!-- section close -->
            <div v-if="isOpen" class="modal-mask">
                <div class="modal-wrapper" @click="$emit('close')">
                    <div class="modal-container" ref="target">
                        <div class="modal-header">
                            <slot name="header"> Rental Terms</slot>
                        </div>
                        <div class="modal-body overflow-y-auto" style="max-height: calc(100vh - 210px);">
                            <CAccordion>
                                <CAccordionItem v-for="(item,index) in activeRentalTerms" :item-key="index">
                                    <CAccordionHeader>
                                        <div v-html="item.title"></div>
                                    </CAccordionHeader>
                                    <CAccordionBody>
                                        <div v-html="item.description"></div>
                                    </CAccordionBody>
                                </CAccordionItem>
                            </CAccordion>
                        </div>
                        <div class="modal-footer">
                            <slot name="footer">
                                <div>
                                    <button class="btn btn-primary" @click="closeModal()">Done</button>
                                </div>
                            </slot>
                        </div>
                    </div>
                </div>
            </div>

            <section id="section-car-details">
                <div class="col-md-12 mt-3" style="left:16%;">
                    <span class="p-1 mr-1 mt-2 btn-main"
                          style="width:400px; background: #f9d602; color: #000; font-family: Arial, sans-serif;"><span
                        class="ti ti-circle-number-1 mr-1"/>Choose Your Location</span>
                    <span class="p-1 mr-1 btn-main mt-2 "
                          style="width:400px; background: #f9d602; color: #000; font-family: Arial, sans-serif;"><span
                        class="ti ti-circle-number-2 mr-1"/>Choose Your Car</span>
                    <span class="p-1 btn-main mt-2 active"
                          style="width:400px; background: rgb(155,147,84);color: #000; font-family: Arial, sans-serif;"><span
                        class="ti ti-circle-number-3 mr-1"/>Reserve Your Car</span>
                </div>
                <div class="row">
                    <div class="col-md-3 " style="margin: 30px 0 0 12%;">

                        <div class="p-1 col-11" style="background-color: #e1e1e1; ">
                            <h5 class="p-2">YOUR SEARCH DETAILS</h5>
                        </div>
                        <div class="col-md-11 pb-4" style="background: #fff;">

                            <div class="row" style="background: #fff;">
                                <h5 class="mt-4">PICK-UP - LOCATION </h5>

                                <p class="col-md-11"><span class=" col-md-1 ti ti-gps"></span>{{ form.pickupLoc }}</p>
                                <span class="col-md-6 ti ti-calendar">&nbsp;{{ form.date_from }}</span>
                                <span class="col-md-3 ti ti-clock">&nbsp;{{ form.time_from }}</span>
                            </div>
                            <hr/>
                            <div class=" my-3 row" style="background: #fff;">
                                <h5>DROP-OFF - LOCATION </h5>
                                <p class="col-12"><span class=" col-md-1 ti ti-gps"></span>{{ form.pickupLoc }}</p>

                                <span class="col-md-6 ti ti-calendar">&nbsp;{{ form.date_to }}</span>
                                <span class="col-md-3 ti ti-clock">&nbsp;{{ form.time_to }}</span>
                            </div>

                            <div class="mt-5">
                                <button type="submit" @click="updateCarOrCountry" class="btn-main btn-fullwidth " style="background: #f9d602">Change Country Or Car</button>
                            </div>
                        </div>
                        <div class="p-1 col-11 mt-3" style="background: #e1e1e1;">
                            <h5 class="p-2">Booking This Car</h5>
                        </div>
                        <div class="col-md-11 pb-4" style="background: #fff;">

                            <form class="trip-form  px-2" @submit.prevent="search">
                                <div class="row  flex-column">
                                    <div class="w-100 mt-4 mb-3 col-md-11">
                                        <el-select
                                            class="w-100"
                                            v-model="form.pickupLoc"
                                            size="large"
                                            placeholder="Pickup..."
                                            disabled>
                                        </el-select>
                                    </div>
                                    <div class="mb-3 row">
                                        <div class="form-control-wrap col-md-7">
                                            <el-date-picker
                                                v-model="form.date_from"
                                                placeholder="Start date"
                                                size="large"
                                                format="YYYY/MM/DD"
                                                value-format="YYYY-MM-DD"
                                                :disabled-date="disabledDate"

                                            />
                                        </div>
                                        <div class="form-control-wrap col-md-5">
                                            <el-time-picker
                                                v-model="form.time_from"
                                                placeholder="Start Time"
                                                size="large"
                                                format="HH:mm"
                                                value-format="HH:mm"
                                            />
                                        </div>
                                    </div>
                                    <div class="mb-3 row">
                                        <div class="form-control-wrap col-md-7">
                                            <el-date-picker
                                                v-model="form.date_to"
                                                placeholder="End date"
                                                size="large"
                                                format="YYYY/MM/DD"
                                                value-format="YYYY-MM-DD"
                                                :disabled-date="disabledDate"

                                            />
                                        </div>
                                        <div class="form-control-wrap col-md-5">
                                            <el-time-picker
                                                v-model="form.time_to"
                                                placeholder="End Time"
                                                size="large"
                                                format="HH:mm"
                                                value-format="HH:mm"
                                            />
                                        </div>
                                    </div>
                                    <div class="  ">
                                        <input type="submit" value="Check Availability"
                                               class="btn-main btn-fullwidth " style="background: #f9d602"/>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="col-md-11 pb-4 mt-4" style="background: #e5e5e3; border: 3px solid #eed616;">
                            <div>
                                <p class="mt-3">Total Rental Price</p>
                                <h3>{{ currency + ' ' + vehicle.final_price }}</h3>
                                <p> For {{ daysNumber }} day{{ daysNumber < 2 ? '' : 's' }} -
                                    {{ currency + ' ' + parseFloat((vehicle.final_price / daysNumber)).toFixed(2) }} /
                                    per
                                    day </p>
                                <div class="row">
                                    <p class="col-md-9">Rental Cost</p>
                                    <p class="col-md-3">{{ currency + '&nbsp' + vehicle.final_price }}</p>
                                </div>
                                <div class="row">
                                    <p class="col-md-9">Extras</p>
                                    <p class="col-md-3">{{ currency + '&nbsp' + 0 }}</p>
                                </div>
                                <div class="row" v-if="priceDiff > 0">
                                    <p class="col-md-9">Old Rental Cost</p>
                                    <p class="col-md-3">{{ currency + '&nbsp' + oldRental?.price }}</p>
                                </div>
                                <div class="row">
                                    <p class="col-md-9">Total Rental Cost</p>
                                    <p class="col-md-3">{{ currency + '&nbsp' + vehicle.final_price }}</p>
                                </div>
                                <div class="row">
                                    <p class="col-md-9">Total Difference</p>
                                    <p class="col-md-3">{{ currency + '&nbsp' + parseFloat(priceDiff).toFixed(2) }}</p>
                                </div>
                                <hr style="margin-bottom: 5%;"/>
                                <div class="row">
                                    <strong class="col-md-8" v-if="parseFloat(priceDiff).toFixed(2) > 0">Pay Now</strong>
                                    <strong class="col-md-8" v-else-if="parseFloat(priceDiff).toFixed(2) < 0">You will be refunded with</strong>
                                    <strong class="col-md-4">{{ currency + ' ' + Math.abs(parseFloat(priceDiff).toFixed(2)) }}</strong>
                                </div>
                                <hr style="margin-top: 1%;"/>
                            </div>
                        </div>

                    </div>
                    <Loader v-if="loading"/>
                    <div v-else class="container bg-white col-md-6 offset-md-0 p-5 h-50" style=" margin-top: 1.7%">
                        <div class="row ">
                                <div class="col-md-5">
                                    <div id="slider-carousel text-nowrap">
                                        <h4 class="" style="margin-left: -20px; font-size: 1.3vw; text-wrap: nowrap;">

                                            {{ vehicle.name }} OR&nbsp;Similar
                                            <el-tooltip placement="right-start">
                                                <template #content>
                                                    <div>
                                                        The supplier will provide a car with same class and specifications,
                                                        though the make may vary.
                                                    </div>
                                                </template>
                                            </el-tooltip>

                                        </h4>
                                        <p>{{ vehicle?.category?.name }}</p>
                                        <div class="row"></div>
                                        <div class="">
                                            <img
                                                :src=" '/img/vehicles/' + vehicle?.photo "
                                                width="350" height="200"/>
                                        </div>
                                        <div class="spacer-30"></div>

                                    </div>
                                </div>

                                <div class="col-md-6 row">
                                    <div class=" row mt-1">
                                        <h4 class="col-md-4 text-nowrap" style="font-size: 1.1vw">
                                            {{ currency + ' ' + vehicle.final_price }}</h4>
                                        <p class="col-md-7 text-nowrap"> For {{ daysNumber }}
                                            day{{ daysNumber < 2 ? '' : 's' }} -
                                            {{ currency + ' ' + parseFloat((vehicle.final_price / daysNumber)).toFixed(2) }}
                                            / per
                                            day </p>
                                    </div>
                                    <div class="row de-spec text-nowrap">
                                        <div v-if="vehicle.specifications" v-for="specification in vehicle.specifications"
                                             class="col-md-6">
                                        <span>
                                            <img style="width: 35%; margin-right: 2px;"
                                                 :src="'/assets/images/icons/' + specification.icon + '.svg'"/>
                                             {{
                                                specification.value
                                            }} {{
                                                specification.name == 'Number of Seats' ? 'Seats' : specification.name == 'Doors' ? 'Doors' : ''
                                            }}
                                        </span>
                                        </div>
                                    </div>
                                    <div class="spacer-single"></div>
                                </div>
                                <div class=" rounded-2 py-1 mb-2 ml-1"
                                     style="background: #edecec; width: 90%; margin-top: -2%; ">
                                    <div class="d-supplier">
                                        <div class="col-md-2 d-img w-100" style="height: 50px">
                                            <img :src="'/img/' + vehicle?.supplier?.logo" height="50"
                                                 width="80" alt=""/>
                                        </div>
                                        <div class="col-md-2 row">
                                            <div>
                                                            <span style="font-size: medium;"
                                                                  class="text-nowrap">{{
                                                                    vehicle?.supplier?.company
                                                                }}</span>
                                            </div>
                                            <div>
                                                <div><a class="cursor-pointer text-primary text-decoration-underline"
                                                        href="javascript:void(0);"
                                                        @click="openRentalTerms(vehicle)">Rental&nbsp;Terms</a></div>
                                            </div>
                                        </div>
                                        <div class="col-md-2">
                                        <span class="py-2 px-1 rounded-1 ml-3"
                                              style=" background-color: #f9d602; font-size: 1.0em;font-weight: 600;">{{ vehicle.supplier_rate }}/10</span>
                                        </div>
                                        <div class="col-md-3">
                                                        <span class="be_media-body"><h5> {{
                                                                vehicle?.supplier_rate >= 1 && vehicle?.supplier_rate <= 2 ? 'Terrible' :
                                                                    vehicle?.supplier_rate > 2 && vehicle?.supplier_rate <= 4 ? 'Ok' :
                                                                        vehicle?.supplier_rate > 4 && vehicle?.supplier_rate <= 6 ? 'Good' :
                                                                            vehicle?.supplier_rate > 6 && vehicle?.supplier_rate <= 8 ? 'Ver Good' :
                                                                                vehicle?.supplier_rate > 8 && vehicle?.supplier_rate <= 10 ? 'Excellent' :
                                                                                    ''
                                                            }}</h5><span
                                                            style="font-size: medium;">(&nbsp;<strong
                                                            style="color: #f9d602">{{ vehicle.supplier_number_of_reviews }}&nbsp;</strong>+&nbsp;reviews)</span></span>
                                        </div>
                                        <div class="col-md-4 ">
                                            <p class="text-nowrap mt-2" style="font-size: 15px;"><i class="fa fa-location"/>
                                                &nbsp;Address:&nbsp;&nbsp;<small
                                                    style="font-size: 12px;">{{ vehicle?.supplier?.address }}</small></p>
                                            <div>
                                                <el-tooltip placement="bottom">
                                                    <template #content>
                                                        <div>
                                                            {{ vehicle?.fuel_policy?.description }}
                                                        </div>
                                                    </template>
                                                    <p style="margin-top: -20px;">
                                                        <strong class="text-nowrap" style="font-size: 15px;"><i
                                                            class="fa fa-gas-pump"/></strong> &nbsp;Fuel Policy:
                                                        <strong
                                                            class="text-nowrap">{{ vehicle?.fuel_policy?.name }} </strong>
                                                    </p>
                                                </el-tooltip>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            <div class="de-box row col-lg-12 mt-5 mb25" v-if="priceDiff > 0">
                                <div class="col-lg-12">
                                    <div class="">
                                        <div class="row">
                                            <p v-if="priceDiff < 0" class="text-danger"></p>
                                            <p v-if="priceDiff > 0" class="text-danger">You Should pay {{parseFloat(priceDiff).toFixed(2) }} {{ currency }} !</p>
                                            <div class="col-lg-12" v-if="user && user.role === 'customer' && priceDiff ">
                                                <form method="post" @submit.prevent="book">
                                                    <div class="row">
                                                        <div class="formbold-mb-3 col-md-6">
                                                            <label class="formbold-form-label">Card Number</label>
                                                            <div class="row">
                                                                <el-input
                                                                    v-model="bookingForm.card_number"
                                                                    size="large"
                                                                    filterable
                                                                    remote
                                                                    reserve-keyword
                                                                    placeholder="Enter front card number..."
                                                                    remote-show-suffix
                                                                    :disabled="loading"
                                                                    required>
                                                                </el-input>
                                                            </div>
                                                        </div>
                                                        <div class="row formbold-mb-3 col-md-6">
                                                            <label class="formbold-form-label">CVV</label>
                                                            <el-input
                                                                v-model="bookingForm.CVV"
                                                                size="large"
                                                                class="col-md-4"
                                                                filterable
                                                                remote
                                                                reserve-keyword
                                                                placeholder="CVV..."
                                                                :disabled="loading"

                                                                remote-show-suffix
                                                                required>
                                                            </el-input>
                                                        </div>
                                                        <div class=" formbold-mb-3 col-md-6">
                                                            <label class="formbold-form-label">Name On Card</label>
                                                            <div class="countries">
                                                                <el-input
                                                                    v-model="bookingForm.name_on_card"
                                                                    size="large"
                                                                    filterable
                                                                    remote
                                                                    reserve-keyword
                                                                    placeholder="Name on Card..."
                                                                    remote-show-suffix
                                                                    :disabled="loading"
                                                                    required>
                                                                </el-input>
                                                            </div>
                                                        </div>
                                                        <div class="row formbold-mb-3 col-md-6">
                                                            <label class="formbold-form-label">Exp Date</label>
                                                            <el-input
                                                                v-model="bookingForm.card_exp_date"
                                                                size="large"
                                                                class="col-md-4"
                                                                filterable
                                                                remote
                                                                :disabled="loading"
                                                                reserve-keyword
                                                                placeholder="YY/MM"
                                                                remote-show-suffix
                                                                required>
                                                            </el-input>
                                                        </div>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                    <ProgressBar v-if="loading" mode="indeterminate" style="height: 6px"></ProgressBar>

                                </div>

                            </div>
                            <button v-if="!loading && priceDiff != 0" id='send_message' @click="book" :disabled="loading"
                                    class="btn-main btn-fullwidth offset-4 col-md-3" style="background: #f9d602">
                                <div v-if="priceDiff > 0">Continue&nbsp;To&nbsp;Payment</div>
                                <div v-else-if="priceDiff < 0">Continue</div>
                            </button>
                        </div>
                    </div>

                </div>


            </section>

        </div>
    </div>
    <Footer/>

    </body>
</template>

<script setup>
import {ref, onMounted} from 'vue'
import {usePage, useForm} from '@inertiajs/vue3';
import {useToast} from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';
import HeaderOne from '../components/HeaderOne.vue'
import Loader from '../components/Loader.vue'
import {router} from "@inertiajs/vue3";
import {CAccordion, CAccordionItem, CAccordionHeader, CAccordionBody} from '@coreui/vue';
import Footer from "../components/Footer.vue";
import getUnicodeFlagIcon from "country-flag-icons/unicode";
import ProgressBar from 'primevue/progressbar';
import 'primevue/resources/themes/aura-light-amber/theme.css'
import moment from "moment";

const isOpen = ref(false)

const closeModal = () => {
    isOpen.value = false;
}

const countryCodes = [
    {"country": "Algeria", "code": "213", "iso": "DZ"},
    {"country": "Australia", "code": "61", "iso": "AU"},
    {"country": "Bahrain", "code": "973", "iso": "BH"},
    {"country": "Canada", "code": "1", "iso": "CA"},
    {"country": "China", "code": "86", "iso": "CN"},
    {"country": "Denmark", "code": "45", "iso": "DK"},
    {"country": "Egypt", "code": "20", "iso": "EG"},
    {"country": "France", "code": "33", "iso": "FR"},
    {"country": "Germany", "code": "49", "iso": "DE"},
    {"country": "Greece", "code": "30", "iso": "GR"},
    {"country": "India", "code": "91", "iso": "IN"},
    {"country": "Indonesia", "code": "62", "iso": "ID"},
    {"country": "Iran", "code": "98", "iso": "IR"},
    {"country": "Iraq", "code": "964", "iso": "IQ"},
    {"country": "Italy", "code": "39", "iso": "IT"},
    {"country": "Jordan", "code": "962", "iso": "JO"},
    {"country": "Kuwait", "code": "965", "iso": "KW"},
    {"country": "Lebanon", "code": "961", "iso": "LB"},
    {"country": "Libya", "code": "218", "iso": "LY"},
    {"country": "Mexico", "code": "52", "iso": "MX"},
    {"country": "Morocco", "code": "212", "iso": "MA"},
    {"country": "Netherlands", "code": "31", "iso": "NL"},
    {"country": "Oman", "code": "968", "iso": "OM"},
    {"country": "Pakistan", "code": "92", "iso": "PK"},
    {"country": "Palestine", "code": "970", "iso": "PS"},
    {"country": "Poland", "code": "48", "iso": "PL"},
    {"country": "Portugal", "code": "351", "iso": "PT"},
    {"country": "Qatar", "code": "974", "iso": "QA"},
    {"country": "Russia", "code": "7", "iso": "RU"},
    {"country": "Saudi Arabia", "code": "966", "iso": "SA"},
    {"country": "Spain", "code": "34", "iso": "ES"},
    {"country": "Sweden", "code": "46", "iso": "SE"},
    {"country": "Switzerland", "code": "41", "iso": "CH"},
    {"country": "Syria", "code": "963", "iso": "SY"},
    {"country": "Tunisia", "code": "216", "iso": "TN"},
    {"country": "Turkey", "code": "90", "iso": "TR"},
    {"country": "United Arab Emirates", "code": "971", "iso": "AE"},
    {"country": "United Kingdom", "code": "44", "iso": "GB"},
    {"country": "United States", "code": "1", "iso": "US"},
];
const user = ref('')
const value = ref(0);
const id = ref('')
const vehicle = ref('')
const currency = ref('')
const date = ref([]);
const priceTax = ref("");
const daysNumber = ref("");
const oldRental = ref("");
const loading = ref(false);

const form = useForm({
    id: "",
    pickupLoc: "",
    date_from: "",
    date_to: "",
    time_from: "",
    time_to: "",
    vehicle: "",
    price: "",
    currency: localStorage.getItem('currency') ?? 'USD',
});
const countries = {
    loading: ref(false),
    all: ref([]),
    list: ref([]),
    options: ref([]),
};

let priceDiff = 0;
let oldPrice = 0;
let changed = false;

const bookingForm = useForm({
    pickupLoc: "",
    date_from: "",
    date_to: "",
    time_from: "",
    time_to: "",
    id: "",
    card_number: "",
    name_on_card: "",
    CVV: "",
    card_exp_date: "",
    currency: "",
    old_rental_id: "",
});
const $toast = useToast();
const getUser = async () => {
    try {
        const response = await axios.get('/get/user/data');
        user.value = response.data;
    } catch (error) {
        console.error(error);
    }
}
const activeRentalTerms = ref('');
const openRentalTerms = (vehicle) => {
    isOpen.value = true
    activeRentalTerms.value = vehicle.rental_terms
}

const updateCarOrCountry = async () => {
    let urlParams = new URLSearchParams(window.location.search);
    urlParams.get('booking_id')
    window.location.href= '/results?booking_id='+urlParams.get('booking_id')+'&pickupLoc='+ form.pickupLoc +'&date[]='+form.date_from+'&date[]='+form.date_to+'&date_from='+form.date_from+'&date_to='+form.date_to+'&time_from='+form.time_from+'&time_to='+form.time_to
}
const getRental = async () => {
    loading.value = true
    try {
        let urlParams = new URLSearchParams(window.location.search);
        const response = await axios.get("/booking/" + urlParams.get('booking_id'));
        if (response.status) {
            oldRental.value = response.data.data
            form.pickupLoc = urlParams.has("pickupLoc") ? urlParams.get("pickupLoc") : response.data.data.vehicle.branch.location
            form.date_from = urlParams.has("date_from") ? urlParams.get("date_from") :  response.data.data.start_date
            form.date_to = urlParams.has("date_to") ? urlParams.get("date_to") :  response.data.data.end_date
            oldPrice = response.data.data.price
            form.time_from = urlParams.has("time_from") ? urlParams.get("time_from") :  moment(response.data.data.start_time, "HH:mm:ss").format("HH:mm")
            form.time_to = urlParams.has("time_to") ? urlParams.get("time_to") :  moment(response.data.data.end_time, "HH:mm:ss").format("HH:mm")
            id.value = urlParams.has("id") ? urlParams.get("id") :  response.data.data.vehicle_id
            form.id = urlParams.has("id") ? urlParams.get("id") : response.data.data.vehicle_id
            loading.value = false;
            getVehicle()
        }
    } catch ($e) {
        console.log($e)
    }

}
const getVehicle = async () => {
    try {
        setTimeout(() => {
            value.value += 1;
        }, 200);
        loading.value = true


        form.id = id.value;
        form.currency = localStorage.getItem('currency') ?? 'USD';

        const response = await axios.post('/get/vehicle/data', form)

        vehicle.value = response.data.data.vehicle
        form.vehicle = vehicle.value.id
        form.price = vehicle.value.final_price

        form.date_from = response.data.data.date_from
        form.date_to = response.data.data.date_to

        date.value = response.data.data.date
        daysNumber.value = response.data.data.days
        loading.value = false


        if(daysNumber.value !== oldRental.value.number_of_days) {
            priceDiff =  vehicle.value.final_price - oldPrice
        }


    } catch (error) {
        if (!error.response.data.status) {
            $toast.error(error.response.data.message, {position: 'top'})
            // router.get('/')
        }
        loading.value = false
        console.error(error)
    }
}


const book = async () => {
    try {
        loading.value = true;


        if (user.value.role !== 'customer') {
            $toast.error("You are not a customer!", {position: 'top'})
            return;
        }

        bookingForm.id = id.value;
        bookingForm.pickupLoc = form.pickupLoc;
        bookingForm.date_from = form.date_from;
        bookingForm.date_to = form.date_to;
        bookingForm.time_from = form.time_from;
        bookingForm.time_to = form.time_to;
        bookingForm.currency = currency.value;
        bookingForm.old_rental_id = oldRental.value.id;
        console.log(bookingForm.data())
        const resposne = await axios.post("/book/vehicles", bookingForm.data());
        if (resposne.status) {
            $toast.success("Thank You for your payment!", {position: 'top', duration: 1000})
            $toast.success("Your Booking has been placed successfully", {position: 'top'})
            router.get('/my-profile')
            loading.value = false;
        }
    } catch (e) {
        loading.value = false;

        $toast.error(e.response.data.message, {position: 'top'})
    }
};

const search = () => {
    getVehicle();
};


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

const disabledDate = (time) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0)
    return time < date
}

onMounted(() => {
    currency.value = localStorage.getItem('currency') ?? 'USD'
    getRental();
    fetchCountries()
    getUser()
})

</script>

<style scoped>
li::before {
    display: none;
}

.item-list {
    display: grid;
    align-items: flex-end;
    padding: 20px;
    background: #ffffff;
    border: solid 1px #dddddd;
    box-shadow: 3px 3px 9px rgba(164, 164, 186, 0.2);
    border-radius: 6px;
}

.scv-badge.badge-white {
    display: flex;
    min-width: 10px;
    padding: 2px 6px 3px 3px;
    color: #605c5c;
    background-color: #fff;
    border-radius: 2em;
    line-height: 14px;
    vertical-align: middle;
    white-space: normal;
    border: 1px solid #ddd;
}

[id|=sc-be] .be_media {
    overflow: hidden;
    transform: scale(1);
    transform-origin: 0 0;
}

.scv-icon.scv-instant {
    height: 29px;
    min-width: 32px;
    width: 32px;
    display: inline-block;
}

[id|=sc-be] .be_media-middle {
    vertical-align: middle;
}

.scv-inst-text {
    display: inline-block;
    font-size: 11px;
    text-align: left;
    vertical-align: middle;
    -webkit-align-self: center;
    align-self: center;
    margin-left: 2px;
}

</style>
