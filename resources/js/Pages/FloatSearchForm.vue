<template>
    <div class="jumbotron-fluid">
        <h1 class="p-fontsize" style="color: #ffffff;"><strong><span>Car Rentals</span> - Search, Book & Enjoy.</strong>
        </h1>
        <div class="form-layout">
            <Loader style="left: 30%" v-if="loading"/>
            <form v-else @submit.prevent="search">
                <div>
                    <div class="row">
                        <label class="text-white">Select Pickup Location</label>
                        <AutoComplete v-model="form.pickupLoc" v-on:item-select="selectLocation($event)"
                                      :class="'col-md-5'" optionLabel="name"
                                      :suggestions="filteredLocations" @complete="suggest"
                                      placeholder="Enter your Location">
                            <template #value="slotProps">
                                <div v-if="slotProps.value" class="flex align-items-center">
                                    <div>{{ slotProps.value }}</div>
                                </div>
                            </template>
                            <template #option="slotProps">
                                <div class="flex align-items-center">
                                    <div>{{ slotProps.option.location }}&nbsp;&nbsp; <i
                                        :class=" slotProps.option.location_type === 'Airport' ? 'fa fa-plane-arrival' : slotProps.option.location_type === 'Downtown' ? 'fa fa-building' : 'fa fa-hotel'"/>
                                    </div>
                                </div>
                            </template>

                        </AutoComplete>

                        <div class="col-md-3  ">
                            <div class=" mt-2 ">
                                <div class=" ">
                                    <el-date-picker
                                        v-model="form.date"
                                        type="daterange"
                                        range-separator="TO"
                                        start-placeholder="Start date"
                                        end-placeholder="End date"
                                        size="large"
                                        required="true"
                                        format="YYYY/MM/DD"
                                        value-format="YYYY-MM-DD"
                                        style="height: 45px;"
                                        :disabled-date="disabledDate"
                                        class="rounded-0 font-size"

                                    />

                                </div>
                            </div>

                        </div>

                        <div class=" col-md-2 mt-2 time-input">
                            <select style="height: 45px;" class=" w-100 form-control rounded-0" v-model="form.time_from">
                                <option value="00:00" selected>00:00</option>
                                <option value="00:30">00:30</option>
                                <option value="01:00">01:00</option>
                                <option value="01:30">01:30</option>
                                <option value="02:00">02:00</option>
                                <option value="02:30">02:30</option>
                                <option value="03:00">03:00</option>
                                <option value="03:30">03:30</option>
                                <option value="04:00">04:00</option>
                                <option value="04:30">04:30</option>
                                <option value="05:00">05:00</option>
                                <option value="05:30">05:30</option>
                                <option value="06:00">06:00</option>
                                <option value="06:30">06:30</option>
                                <option value="07:00">07:00</option>
                                <option value="07:30">07:30</option>
                                <option value="08:00">08:00</option>
                                <option value="08:30">08:30</option>
                                <option value="09:00">09:00</option>
                                <option value="09:30">09:30</option>
                                <option value="10:00" selected="selected">10:00</option>
                                <option value="10:30">10:30</option>
                                <option value="11:00">11:00</option>
                                <option value="11:30">11:30</option>
                                <option value="12:00">12:00</option>
                                <option value="12:30">12:30</option>
                                <option value="13:00">13:00</option>
                                <option value="13:30">13:30</option>
                                <option value="14:00">14:00</option>
                                <option value="14:30">14:30</option>
                                <option value="15:00">15:00</option>
                                <option value="15:30">15:30</option>
                                <option value="16:00">16:00</option>
                                <option value="16:30">16:30</option>
                                <option value="17:00">17:00</option>
                                <option value="17:30">17:30</option>
                                <option value="18:00">18:00</option>
                                <option value="18:30">18:30</option>
                                <option value="19:00">19:00</option>
                                <option value="19:30">19:30</option>
                                <option value="20:00">20:00</option>
                                <option value="20:30">20:30</option>
                                <option value="21:00">21:00</option>
                                <option value="21:30">21:30</option>
                                <option value="22:00">22:00</option>
                                <option value="22:30">22:30</option>
                                <option value="23:00">23:00</option>
                                <option value="23:30">23:30</option>
                            </select>
                        </div>

                        <div class=" col-md-2 mt-2 time-input">
                            <select style="height: 45px;" class=" w-100 form-control rounded-0"
                                    v-model="form.time_to">
                                <option value="00:00">00:00</option>
                                <option value="00:30">00:30</option>
                                <option value="01:00">01:00</option>
                                <option value="01:30">01:30</option>
                                <option value="02:00">02:00</option>
                                <option value="02:30">02:30</option>
                                <option value="03:00">03:00</option>
                                <option value="03:30">03:30</option>
                                <option value="04:00">04:00</option>
                                <option value="04:30">04:30</option>
                                <option value="05:00">05:00</option>
                                <option value="05:30">05:30</option>
                                <option value="06:00">06:00</option>
                                <option value="06:30">06:30</option>
                                <option value="07:00">07:00</option>
                                <option value="07:30">07:30</option>
                                <option value="08:00">08:00</option>
                                <option value="08:30">08:30</option>
                                <option value="09:00">09:00</option>
                                <option value="09:30">09:30</option>
                                <option value="10:00" selected="selected">10:00</option>
                                <option value="10:30">10:30</option>
                                <option value="11:00">11:00</option>
                                <option value="11:30">11:30</option>
                                <option value="12:00">12:00</option>
                                <option value="12:30">12:30</option>
                                <option value="13:00">13:00</option>
                                <option value="13:30">13:30</option>
                                <option value="14:00">14:00</option>
                                <option value="14:30">14:30</option>
                                <option value="15:00">15:00</option>
                                <option value="15:30">15:30</option>
                                <option value="16:00">16:00</option>
                                <option value="16:30">16:30</option>
                                <option value="17:00">17:00</option>
                                <option value="17:30">17:30</option>
                                <option value="18:00">18:00</option>
                                <option value="18:30">18:30</option>
                                <option value="19:00">19:00</option>
                                <option value="19:30">19:30</option>
                                <option value="20:00">20:00</option>
                                <option value="20:30">20:30</option>
                                <option value="21:00">21:00</option>
                                <option value="21:30">21:30</option>
                                <option value="22:00">22:00</option>
                                <option value="22:30">22:30</option>
                                <option value="23:00">23:00</option>
                                <option value="23:30">23:30</option>
                            </select>
                        </div>
                    </div>


                    <!-- Mobile: split date + time -->
                    <button class="search-button  px-5 mt-2" @click="search">
                        SEARCH CARS
                    </button>
                    <a class="mobile-currency col-md-2">
                        <CDropdown togglerText="Dropdown button" class="mt-1 ">
                            <CDropdownToggle class="text-black " component="a" style="color: rgba(30, 30, 30, 1);">
                               {{selectedCurrency }}
                            </CDropdownToggle>
                            <CDropdownMenu>
                                <CDropdownItem class="cursor-pointer " v-for="currency in currencies"
                                               v-on:click="changeCurrency(currency.name)">
                                    <p class="text-black "><img style="margin-right: 25px"
                                                                :src="'https://flagsapi.com/' + currency.flag + '/shiny/32.png'">
                                        {{ currency.name }}</p>
                                </CDropdownItem>
                            </CDropdownMenu>
                        </CDropdown>
                    </a>
                    <p class="col-md-12 text-white position-relative float-right included-part" style="top: 10px">
                        <i class="col-md-2 fa fa-check-square fa-xl " style="color: #7fff1f; margin-right: -13%;"/>Free
                        Cancellation
                        <i class="col-md-2 fa fa-check-square fa-xl " style="color: #7fff1f; margin-right: -13%;"/>No
                        Credit
                        card fees
                        <i class="col-md-2 fa fa-check-square fa-xl " style="color: #7fff1f; margin-right: -13%;"/>No
                        hidden
                        fees
                        <i class="col-md-2 fa fa-check-square fa-xl " style="color: #7fff1f; margin-right: -13%;"/>Free
                        amendment
                    </p>
                </div>

            </form>

        </div>
        <h1 class="py-3 p-fontsize" style=" color: #ffffff;">
            <strong> Looking for a vehicle? You're at the right place!<br/></strong>
        </h1>
        <div class="text-white font-weight-bold included-part">

        </div>
    </div>
</template>

<script setup>
import {ref, onMounted} from 'vue'
import {router, useForm} from '@inertiajs/vue3';
import Loader from '../components/Loader.vue'
import Dropdown from 'primevue/dropdown';
import 'primevue/resources/themes/aura-light-amber/theme.css'
import AutoComplete from 'primevue/autocomplete';
import {CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle} from "@coreui/vue";

import getUnicodeFlagIcon from 'country-flag-icons/unicode'

const value = ref()
const form = useForm({
    pickupLoc: ref(),
    date: ref(''),
    date_from: ref(''),
    date_to: ref(''),
    time_from: ref('00:00'),
    time_to: ref('00:00')
});
const logos = ref({})
const countries = ref('')

const locations = {
    all: ref([]),
    options: ref([]),
    loading: ref(false),
}
let selectedCurrency = ref('USD');
const filteredLocations = ref()
const loading = ref(false);
var field = ''
const vehicles = ref([])

let currencies = [
    {name: 'USD', flag: getUnicodeFlagIcon('US')},
    {name: 'AED', flag: getUnicodeFlagIcon('AE')},
    {name: 'EGP', flag: getUnicodeFlagIcon('EG')}
];

const disabledDate = (time) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0)
    return time < date
}

const selectLocation = ($event) => {
    form.pickupLoc = form.pickupLoc.location
}
const getLogos = async () => {
    try {
        loading.value = true
        const response = await axios.get('get/logos')
        logos.value = response.data
        loading.value = false

    } catch (error) {
        console.error(error)
    }
}

const getVehicles = async () => {
    try {
        loading.value = true

        const response = await axios.get('get/vehicles')
        vehicles.value = response.data
        loading.value = false
    } catch (error) {
        console.error(error)
    }
}

const getLocations = async () => {
    locations.loading.value = true;
    loading.value = true

    try {
        const response = await axios.get('/get/locations')
        locations.all.value = Object.values(response.data)
        setTimeout(() => {
            const el = document.getElementsByClassName('p-autocomplete-input');
            el[0].style.width = '100%'
            el[0].style.height = '45px'
            el[0].style.borderRadius = 0
            el[0].style.marginTop = 7
        }, 200)
        loading.value = false
    } catch (error) {
        console.error(error)
    } finally {
        locations.loading.value = false;
    }
}
const suggest = (event) => {
    if (!event.query.trim().length) {
        filteredLocations.value = [...locations.all.value.location];
    } else {

        filteredLocations.value = locations.all.value.filter((location) => {
            return location.location.toLowerCase().includes(event.query.toLowerCase());
        });
    }
}


const search = async () => {
    // loading.value = true

    form.date_from = form.date[0];
    form.date_to = form.date[1];

    console.log(form.pickupLoc)
    if (form.date[0] == undefined || form.date_from.value === null) {
        alert('Please Select Start Date.')
        loading.value = false
        return;
    }

    if (form.date[1] == [] || form.date_to.value === null) {
        alert('Please Select End Date.')
        loading.value = false
        return;
    }

    if (form.time_from.value == [] || form.time_from.value === null) {
        alert('Please Select Start Time.')
        loading.value = false
        return;
    }

    if (form.time_to.value == [] || form.time_to.value === null) {
        alert('Please Select End Time.')
        loading.value = false
        return;
    }

    const date_time_from = new Date(form.date_from + ' ' + form.time_from);
    const date_time_to = new Date(form.date_to + ' ' + form.time_to);

    if (date_time_from > date_time_to) {
        alert('Please Select Start Date Time after End Date Time.')
        loading.value = false
        return;
    }

    if (form.pickupLoc == null || form.pickupLoc == [] || form.pickupLoc == 'Enter Your destination!') {
        loading.value = false
        alert('Please Select Location.')
        return;
    }


    router.get('/results', form.data())
    loading.value = false

}
const getCurrencies = async () => {
    try {
        const response = await axios.get('/get/currencies');
        currencies = response.data
    } catch (error) {
        console.log(error.response.data.message);
    }
}
const changeCurrency = (currency) => {
    selectedCurrency.value = currency
    localStorage.removeItem('currency')
    localStorage.setItem('currency', currency)
    window.location.reload()
}
onMounted(() => {
    selectedCurrency.value = localStorage.getItem('currency') ?? 'USD'
    getLocations();
    getVehicles();
    getLogos();
    getCurrencies()
    // $('.p-autocomplete-input').addClass('custom-autocomplete');


})


</script>

<style lang="scss" scoped>
@import '../../css/custom.css';

#banner {
    position: relative;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba($color: #000000, $alpha: .5);
    }
}

header {
    width: 100%;
    position: static;
    background: transparent;
    margin: 0;
    border-bottom: none;
}

.trip-form {
    border-radius: 7px;
    position: relative;
    z-index: 3;
}

$easing: cubic-bezier(0.680, -0.550, 0.265, 1.550);
$color: white;


.form-layout {
    position: relative;
    padding: 2%;
    background: #0e1418c2;
    height: 260px;
}

@media screen and (max-width: 1200px) {
    .included-part {
        display: none;
    }
}

.acc {
    .wrapper {
        width: 400px;
        margin: 0 auto;
        background: white;
        border-radius: 4px;
        position: relative;
        box-shadow: 0px 2px rgba(0, 0, 0, 0.12);

        p {
            display: block;
            margin-block-start: 1em;
            margin-block-end: 1em;
            margin-inline-start: 0px;
            margin-inline-end: 0px;
            transition: all .3s ease;
        }

        label {
            display: block;
            position: relative;
            color: #b5abab;
            overflow: hidden;
            cursor: pointer;
            height: 56px;
            -webkit-transition: text-indent 0.2s;
            text-indent: 20px;
            padding-top: 1px;
        }

        ul {
            margin: 0;
            padding: 0;
        }

        li {
            color: white;
            list-style-type: none;

            a {
                display: block;
                width: 100%;
                padding: 15px 0px;
                text-decoration: none;
                color: #434447;
                border-bottom: 1px solid rgba(0, 0, 0, 0.06);
            }

            a:hover {
                background-color: rgba(0, 0, 0, 0.06);
            }
        }

        label:hover {
            background: rgba(244, 216, 73, 0.5) !important;
            color: #434447;

            p {
                transform: translateX(20px);
            }
        }

        input[type="checkbox"] {
            display: none;
        }

        span {
            height: 3px;
            position: absolute;
            width: 0px;
            display: block;
            top: 58px;
            background: #f4d849;
        }

        .content {
            height: 0;
            background: rgba(244, 216, 73, 0.7);
            height: 300px;
            position: relative;
            border-top: 2px solid rgba(0, 0, 0, 0.12);
            top: 4px;
        }

        .lil_arrow {
            width: 5px;
            height: 5px;
            -webkit-transition: transform 0.8s;
            transition: transform 0.8s;
            -webkit-transition-timing-function: cubic-bezier(0.68, -0.55, 0.265, 1.55);
            border-top: 2px solid rgba(0, 0, 0, 0.33);
            border-right: 2px solid rgba(0, 0, 0, 0.33);
            float: right;
            position: relative;
            top: -30px;
            right: 27px;
            transform: rotate(45deg)
        }

        input[type="checkbox"]:checked + label > .content {
            display: block;
        }

        input[type="checkbox"]:checked + label > span {
            display: none;
        }

        input[type="checkbox"]:checked + label > .lil_arrow {
            -webkit-transition: transform 0.8s;
            transition: transform 0.8s;
            -webkit-transition-timing-function: cubic-bezier(0.68, -0.55, 0.265, 1.55);
            transform: rotate(135deg)
        }

        input[type="checkbox"]:checked + label {
            display: block;
            background: rgba(244, 216, 73, 0.5) !important;
            color: #434447;
            text-indent: 30px;
            height: 275px;
            -webkit-transition: height 0.8s;
            transition: height 0.8s;
            -webkit-transition-timing-function: cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        label:hover > span {
            width: 100%;
            -webkit-transition-timing-function: $easing;
            transition: width 0.4s;
        }

        input[type='checkbox']:not(:checked) + label {
            display: block;
            -webkit-transition: height 0.8s;
            -moz-transition: height 0.8s;
            transition: height 0.8s;
            height: 60px;
            -webkit-transition-timing-function: $easing;
        }
    }
}

::-webkit-scrollbar {
    display: none;
}

// images
/*
//@mixin mQ($px) {
//    @media screen and (max-width: $px) {
//        @content;
//    }
//}

//section {
//    display: grid;
//    grid-template-columns:25% 30% 15% 25%;
//    gap: 15px;
//    place-content: center;
//    grid-template-rows: 50% 50%;
//    height: 80vh;
//    min-height: 460px;
//    padding: max(2vh, 1.5rem);
//
//    img {
//        width: 100%;
//        display: block;
//        height: 100%;
//        object-fit: cover;
//    }
//
//    h2 {
//        color: white;
//        font-size: clamp(1rem, 0.8750rem + 0.6250vw, 1.5rem);
//        line-height: 1.3;
//        font-weight: 700;
//    }
//
//    @include mQ(690px) {
//        height: 65vh;
//    }
//
//    @include mQ(470px) {
//        grid-template-columns:repeat(2, 1fr);
//        grid-template-rows: repeat(3, 35%);
//    }
//
//    .card {
//        border-radius: 25px;
//        box-shadow: -2px 4px 15px rgb(0 0 0 / 26%);
//
//        @include mQ(470px) {
//            grid-column: span 1;
//        }
//
//        &:nth-child(2) {
//            grid-column: 2/3;
//            grid-row: span 2;
//
//            @include mQ(690px) {
//                grid-column: span 1;
//                grid-row: span 1;
//            }
//        }
//
//        &:nth-child(3) {
//            grid-column: span 2;
//
//            @include mQ(690px) {
//                grid-column: 2/4;
//                grid-row: 1/2;
//            }
//        }
//
//        @include mQ(690px) {
//            &:nth-child(6) {
//                grid-column: 2/4;
//                grid-row: 2/3;
//            }
//        }
//
//        @include mQ(470px) {
//
//            &:nth-child(5) {
//                grid-column: span 2;
//            }
//        }
//
//        p {
//            font-size: clamp(0.9rem, 0.8750rem + 0.1250vw, 1rem);
//            line-height: 1.4;
//        }
//
//
//        img {
//            border-radius: 25px;
//        }
//
//        .card__img {
//            position: relative;
//            height: 100%;
//
//            .card__overlay {
//                position: absolute;
//                bottom: 0;
//                left: 0;
//                content: "";
//                color: #fff;
//                padding: clamp(0.938rem, 5vw, 1.563rem);
//                background: rgb(2, 2, 46);
//                background: linear-gradient(0deg, rgb(0 0 0 / 57%) 0%, rgb(255 255 255 / 0%) 100%);
//                width: 100%;
//                height: 100%;
//                border-radius: 25px;
//                display: flex;
//                justify-content: flex-end;
//                flex-direction: column;
//            }
//
//            span {
//                position: absolute;
//                top: 25px;
//                left: min(2vmax, 1.563rem);
//                color: #ff7b29;
//                background: #fff;
//                border-radius: 50px;
//                padding: 2px 8px 2px 6px;
//                display: flex;
//                box-shadow: 0px 1px 20px #0000002b;
//
//                @include mQ(690px) {
//                    top: 20px;
//                }
//
//                @include mQ(470px) {
//                    top: 15px;
//                }
//
//                svg {
//                    fill: #ff7b29;
//                    width: 20px;
//                    margin-right: 2px;
//                }
//            }
//        }
//    }
//}*/

.danger {
    color: red;
}

.jumbotron-fluid {
    width: 75%;
}

.search-button {
    font-weight: bold;
    top: 30px;
    height: 60px;
    background: rgb(249, 214, 2);
    color: #000;
    position: relative;
    float: right;
}

.mobile-currency {
    display: none;
}

@media screen and (max-width: 999px) {
    .jumbotron-fluid {
        width: 100%;
    }
    .date-input {
        width: 100% !important;
    }
    .time-input {
        width: 50%;
    }

    .p-fontsize {
        margin: 0 20px 0 20px;
        font-size: 5vw;
    }
    .search-button {
        width: 70%;
        font-weight: bold;
        top: 0;
        height: 60px;
        background: rgb(249, 214, 2);
        color: #000;
        position: relative;
        float: left;
    }

    .form-layout {
        height: 300px;
    }
    .mobile-currency {
        display: block;
        background: #06b606;
        text-align: center;
        width: 28%;
        float: right;
        top: 10px;
        height: 55px;
        align-content: center;
    }
}


</style>
