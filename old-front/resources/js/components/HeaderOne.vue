<template>

    <header style="background: #f9d602; height: 85px;">
        <div id="mySidenav" class="sidenav">
                <div class="row" style=" background: #f9d602; margin-top: -60px;">
                    <a style="width:20%; margin-top: 3%;" href="javascript:void(0)" class="col-md-10 text-nowrap"><i @click="closeNav()" class="fa fa-arrow-left"/></a>
                    <a style="width:20%;" href="/" class="text-nowrap"> <img src="/img/4k-logo.png" width="150" alt="logo"></a>
                </div>
            <a v-if="!user" class="nav-link col-md-2  text-black text-nowrap" href="/"><i class="fa fa-home"/> Home</a>
            <a v-if="!user" class="nav-link col-md-2  text-black text-nowrap" href="/register"><i class="fa fa-car"/>&nbsp;Bookings</a>
            <a v-else-if="user.role !== 'customer'" class="nav-link col-md-2 text-black text-nowrap"
               href="/company"><span>My&nbsp;console</span></a>
            <a v-if="!user" class="nav-link col-md-2  text-black text-nowrap" href="/contact-us"><i class="fa fa-phone"/> Contact&nbsp;us</a>
            <a v-if="!user" class="nav-link col-md-2  text-black text-nowrap" href="/about-us"><i class="fa fa-book"/> About&nbsp;us</a>
            <a v-if="user.role === 'customer'" class="col-md-2 text-nowrap" @click="() => router.get('/my-profile')"><i class="fa fa-user"/> My&nbsp;Profile</a>
            <a v-if="user.role === 'customer'" class="col-md-2 text-nowrap" @click="() => router.get('/logout')"><i class="fa fa-log-out"/> Log&nbsp;Out</a>
        </div>


        <div class="row align-items-center justify-content-between">
            <div class="col-7 col-md-7 d-flex justify-content-start">
                <a href="/"><img src="/img/4k-logo.png" width="200" alt="logo"></a>
            </div>
            <div class="mobile-nav-icon col-1 col-md-1 bold justify-content-end" style="font-size: x-large;">
                <a class=" icon text-black " href="javascript:void(0);" @click="myFunction()">
                    <i class="fa fa-bars"/>
                </a>
            </div>


            <div class="row topnav  justify-content-end align-items-center col-5 col-md-5 " id="myTopnav">

                    <a v-if="!user" class="nav-link col-4  col-md-4  text-black " href="/register">Manage&nbsp;Booking</a>
                    <a v-else-if="user.role !== 'customer'" class="nav-link col-md-2 text-black " href="/company"><span>My&nbsp;console</span></a>

                    <a v-if="user.role === 'customer'" class="col-md-2">
                        <CDropdown togglerText="Dropdown button" class="mt-1">
                            <CDropdownToggle component="a" style="color: rgba(30, 30, 30, 1);" class="">{{
                                    user.name
                                }}
                            </CDropdownToggle>
                            <CDropdownMenu>
                                <CDropdownItem class="cursor-pointer  text-black "
                                               @click="() => router.get('/my-profile')"><i
                                    class="fa fa-user "/>&nbsp;&nbsp;My&nbsp;Profile
                                </CDropdownItem>
                                <CDropdownItem class="cursor-pointer text-black " @click="() => router.get('/logout')">
                                    <i
                                        class="fa fa-door-closed"/>&nbsp;&nbsp;Log&nbsp;Out
                                </CDropdownItem>
                            </CDropdownMenu>
                        </CDropdown>
                    </a>
                    <a class="col-md-2 ml-3 ">
                        <CDropdown togglerText="Dropdown button" class="mt-1 ">
                            <CDropdownToggle class="text-black " component="a" style="color: rgba(30, 30, 30, 1);">{{
                                    selectedCurrency
                                }}
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
            </div>

        </div>
    </header>

</template>
<script setup>
import {Link, router} from '@inertiajs/vue3'
import {onMounted, ref} from 'vue'
import {CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle} from '@coreui/vue';
import getUnicodeFlagIcon from 'country-flag-icons/unicode'

let currencies = [
    {name: 'USD', flag: getUnicodeFlagIcon('US')},
    {name: 'AED', flag: getUnicodeFlagIcon('AE')},
    {name: 'EGP', flag: getUnicodeFlagIcon('EG')}
];

const user = ref('')
let selectedCurrency = ref('EGP');
const getUser = async () => {
    try {
        const response = await axios.get('/get/user/data');
        user.value = response.data;
    } catch (error) {
        console.error(error);
    }
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
    getUser();
    getCurrencies();
})
const myFunction = () => {
    document.getElementById("mySidenav").style.width = "250px";
    document.getElementById("main").style.marginLeft = "250px";
}
const closeNav = () => {
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("main").style.marginLeft= "0";
}
</script>

<style>
body {
    margin: 0;
    font-family: Arial, Helvetica, sans-serif;
}

.topnav {
    align-content: end;
    background-color: rgb(249, 214, 2);
}

.topnav a {
    display: block;
    color: #f2f2f2;
    height: 40px;
    font-size: 17px;
}


.topnav a:hover {
    background-color: rgba(232, 200, 4, 0.66);
    height: 40px;
}

.mobile-nav-icon {
    display: none;
}

@media screen and (max-width: 999px) {
    #myTopnav {
        display: none;
    }

    .mobile-nav-icon {
        display: block !important;
    }
}

.el-picker-panel {
    color: #000 !important;
}

.el-date-range-picker {
    --el-datepicker-active-color: rgb(249, 214, 2) !important;
    --el-datepicker-hover-text-color: rgb(249, 214, 2) !important;
    --el-datepicker-inrange-bg-color: rgba(249, 214, 2, 0.19) !important;
}

.el-date-table td.today .el-date-table-cell__text {
    color: rgb(249, 214, 2) !important;
    background: rgba(249, 214, 2, 0.26) !important;
}

.el-date-table td.current:not(.disabled) .el-date-table-cell__text {
    background-color: rgb(249, 214, 2) !important;
}


.sidenav {
    height: 100%;
    width: 0;
    position: fixed;
    z-index: 1;
    top: 0;
    left: 0;
    background-color: #ffffff;
    overflow-x: hidden;
    transition: 0.5s;
    padding-top: 60px;
}

.sidenav a {
    padding: 10px 8px 8px 30px;
    text-decoration: none;
    font-size: 17px;
    color: #000000;
    display: block;
    transition: 0.3s;
}

.sidenav a:hover {
    color: rgba(232, 200, 4, 0.66);
}

.sidenav .closebtn {
    position: absolute;
    top: 80px;
    font-size: 36px;
}


@media screen and (max-height: 450px) {
    .sidenav {padding-top: 15px;}
    .sidenav a {font-size: 18px;}
}
</style>
