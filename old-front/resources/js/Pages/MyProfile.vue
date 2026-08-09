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
                <div class="container mt-5">
                    <div class="card overflow-hidden">
                        <div class="card-body p-0">
                            <img src="images/akrom.jpg" alt="" class="img-fluid">
                            <div class="row align-items-center">
                                <div class="col-lg-4 order-lg-1 order-2">
                                    <div class="d-flex align-items-center justify-content-around m-4">
                                        <div class="text-center">
                                            <i class="fa fa-car fs-6 d-block mb-2"></i>
                                            <h4 class="mb-0 fw-semibold lh-1">{{ user?.rentals?.length }}</h4>
                                            <p class="mb-0 fs-4">Rentals</p>
                                        </div>
                                        <div class="text-center">
                                            <i class="fa fa-cancel fs-6 d-block mb-2"></i>
                                            <h4 class="mb-0 fw-semibold lh-1">{{
                                                    user?.rentals?.filter(function (item) {
                                                        return item.order_status === 3
                                                    }).length
                                                }}</h4>
                                            <p class="mb-0 fs-4">Cancelled</p>
                                        </div>
                                        <div class="text-center">
                                            <i class="fa fa-check fs-6 d-block mb-2"></i>
                                            <h4 class="mb-0 fw-semibold lh-1">{{
                                                    user?.rentals?.filter(function (item) {
                                                        return item.order_status === 2
                                                    }).length
                                                }}</h4>
                                            <p class="mb-0 fs-4">Confirmed</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-lg-4 mt-n3 order-lg-2 order-1">
                                    <div class="mt-n5">
                                        <div @click="updatePhoto"
                                             class="d-flex align-items-center justify-content-center mb-2">
                                            <div
                                                class="linear-gradient d-flex align-items-center justify-content-center rounded-circle"
                                                style="width: 110px; height: 110px;">
                                                <input type="file" id="profile_pic" v-on:change="uploadPhoto"
                                                       hidden=""/>
                                                <div
                                                    class="border border-4 border-white d-flex align-items-center justify-content-center rounded-circle overflow-hidden"
                                                    style="width: 100px; height: 100px;">
                                                    <img :src="'img/'+user.logo" alt="" class="w-100 h-100">
                                                </div>
                                            </div>
                                            <i class="cursor-pointer fa fa-pencil-square fa-xl mt-5"/>
                                        </div>

                                        <div class="text-center">
                                            <h5 class="fs-5 mb-0 fw-semibold">{{ user.name }}</h5>
                                            <p class="mb-0 fs-4">{{ user.email }}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <ul class="nav nav-pills user-profile-tab justify-content-end mt-2 bg-light-info rounded-2"
                                id="pills-tab" role="tablist">
                                <li class="nav-item" role="presentation">
                                    <button
                                        class="nav-link position-relative rounded-0 active d-flex align-items-center justify-content-center bg-transparent fs-3 py-6"
                                        id="pills-rentals-tab" data-bs-toggle="pill" data-bs-target="#pills-rentals"
                                        type="button" role="tab" aria-controls="pills-rentals" aria-selected="true">
                                        <i class="fa fa-car me-2 fs-6"></i>
                                        <span class="d-none d-md-block">Rentals</span>
                                    </button>
                                </li>
                                <li class="nav-item" role="presentation">
                                    <button
                                        class="nav-link position-relative rounded-0 d-flex align-items-center justify-content-center bg-transparent fs-3 py-6"
                                        id="pills-about-tab" data-bs-toggle="pill" data-bs-target="#pills-about"
                                        type="button" role="tab" aria-controls="pills-about" aria-selected="false"
                                        tabindex="-1">
                                        <i class="fa fa-user me-2 fs-6"></i>
                                        <span class="d-none d-md-block">About</span>
                                    </button>
                                </li>
                                <li class="nav-item" role="presentation">
                                    <button
                                        class="nav-link position-relative rounded-0 d-flex align-items-center justify-content-center bg-transparent fs-3 py-6"
                                        id="pills-friends-tab" data-bs-toggle="pill" data-bs-target="#pills-friends"
                                        type="button" role="tab" aria-controls="pills-friends" aria-selected="false"
                                        tabindex="-1">
                                        <i class="fa fa-credit-card me-2 fs-6"></i>
                                        <span class="d-none d-md-block">My Cards</span>
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div class="tab-content" id="pills-tabContent">
                        <div class="tab-pane fade show active" id="pills-rentals" role="tabpanel"
                             aria-labelledby="pills-rentals-tab" tabindex="0">
                            <div class="d-sm-flex align-items-center justify-content-between mt-3 mb-4">
                                <h3 class="mb-3 mb-sm-0 fw-semibold d-flex align-items-center">Rentals <span
                                    class="badge text-bg-secondary fs-2 rounded-4 py-1 px-2 ms-2">{{
                                        user?.rentals?.length
                                    }}</span>
                                </h3>

                                <form class="position-relative">
                                    <input type="text" class="form-control search-chat py-2 ps-5" id="text-srh"
                                           placeholder="Search Friends">
                                    <i class="ti ti-search position-absolute top-50 start-0 translate-middle-y text-dark ms-3"></i>
                                </form>
                            </div>
                            <div class="row">
                                <div v-for="rental in user.rentals" class="col-lg-4 col-12">
                                    <!-- card -->

                                    <div class="card mb-5 rounded-3">
                                        <div class="col-md-1" style="top: 0; left: 83%;">
                                            <CDropdown togglerText="Dropdown button" class="mt-1 dropdown">
                                                <CDropdownToggle component="a" style="color: rgba(30, 30, 30, 1);"><i
                                                    class="fa fa-bars"/></CDropdownToggle>
                                                <CDropdownMenu>
                                                    <CDropdownItem :disabled="loading" class="cursor-pointer"
                                                                   style="color: black;"
                                                                   @click="cancelBooking(rental)"><i
                                                        class="fa fa-repeat"/>&nbsp;Cancel
                                                    </CDropdownItem>
                                                    <CDropdownItem @click="downloadInvoice(rental)" :disabled="loading"
                                                                   class="cursor-pointer" style="color: black;"
                                                    ><i class="fa fa-download"/>&nbsp;Download&nbsp;invoice
                                                    </CDropdownItem>

                                                </CDropdownMenu>
                                            </CDropdown>
                                        </div>
                                        <div>
                                            <img :src="'img/vehicles/'+ rental.vehicle.photo" alt="Image"
                                                 height="250" width="400">
                                        </div>
                                        <!-- avatar -->

                                        <div class="avatar avatar-xl mt-n7 ms-4">
                                            <img :src="'img/'+ rental.vehicle.supplier.logo" alt="Image" height="80"
                                                 width="80"
                                                 class="mt-3 rounded-circle border-4 border-white-color-40">
                                        </div>
                                        <!-- card body -->
                                        <div class="card-body">
                                            <!-- Title -->
                                            <h4 class="mb-1">{{ rental.vehicle.name }}</h4>
                                            <p>{{ rental.vehicle.supplier.name }}</p>
                                            <p>#{{ rental.order_number }}</p>

                                            <p><strong> Start Date:</strong> {{ rental.start_date }} </p>
                                            <p><strong> End Date:</strong> {{ rental.end_date }}</p>
                                            <p>
                                                {{ rental.vehicle.branch.location }}
                                            </p>
                                            <div>
                                                <!-- Dropdown -->
                                                <div class="d-flex justify-content-between align-items-center">
                                                    <a style="color:white" :class="
                                                rental.status.id=== 2 ? 'btn btn-success'
                                                : rental.status.id=== 3 ? 'btn btn-danger'
                                                : rental.status.id=== 4 ? 'btn btn-warning'
                                                 : 'btn btn-primary' ">{{ rental.status.name_en }}</a>
                                                    <button class="btn btn-warning"
                                                            v-if="moment(rental.start_date).isAfter(moment(Date.now())) && rental.order_status == 2"
                                                            @click="updateReservation(rental.id)"
                                                    ><i class="fa fa-pencil"/>&nbsp; Modify
                                                    </button>


                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                        <div class="tab-pane fade show " id="pills-about" role="tabpanel"
                             aria-labelledby="pills-about-tab" tabindex="1">
                            <div class="row bg-white p-5 rounded-5">
                                <form method="post" @submit.prevent="register">
                                    <div class="row">
                                        <div class="formbold-mb-3 col-md-4">
                                            <label class="formbold-form-label">Full name</label>
                                            <div class="row">

                                                <el-input
                                                    v-model="RegisterForm.name"
                                                    size="large"
                                                    filterable
                                                    disabled
                                                    remote
                                                    reserve-keyword
                                                    placeholder="Enter Full name here..."
                                                    remote-show-suffix
                                                    :loading="countries.loading.value"
                                                    required>
                                                </el-input>
                                            </div>
                                        </div>
                                        <div class="formbold-mb-3 col-md-6">
                                            <label class="formbold-form-label">Country</label>
                                            <div class="countries row">
                                                <el-select
                                                    disabled
                                                    v-model="RegisterForm.country"
                                                    size="large"
                                                    filterable
                                                    class="col-md-8"
                                                    reserve-keyword
                                                    placeholder="Select Country..."
                                                    remote-show-suffix
                                                    :loading="countries.loading.value"
                                                    required>
                                                    <el-option
                                                        v-for="item in countries.list.value"
                                                        :key="item.id"
                                                        :label="item.label"
                                                        :value="item.label"
                                                    />
                                                </el-select>
                                            </div>
                                        </div>
                                        <div class="formbold-mb-3 col-md-4">
                                            <label class="formbold-form-label">E-mail</label>
                                            <div class="countries">
                                                <el-input
                                                    v-model="RegisterForm.email"
                                                    size="large"
                                                    filterable
                                                    disabled
                                                    remote
                                                    reserve-keyword
                                                    placeholder="E-mail..."
                                                    remote-show-suffix
                                                    required>
                                                </el-input>
                                            </div>
                                        </div>
                                        <div class="formbold-mb-3 col-md-4">
                                            <label class="formbold-form-label">Phone</label>
                                            <div class="row">
                                                <el-input
                                                    v-model="RegisterForm.phone"
                                                    size="large"
                                                    filterable
                                                    remote
                                                    disabled
                                                    reserve-keyword
                                                    placeholder="Phone Number..."
                                                    remote-show-suffix
                                                    :loading="countries.loading.value"
                                                    required>
                                                </el-input>
                                            </div>
                                        </div>

                                    </div>
                                </form>
                            </div>
                        </div>


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
import Footer from "../components/Footer.vue";
import HeaderOne from "../components/HeaderOne.vue";
import {useToast} from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';
import {router, useForm} from '@inertiajs/vue3';
import getUnicodeFlagIcon from "country-flag-icons/unicode";
import moment from 'moment';
import {CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle} from "@coreui/vue";

const $toast = useToast();
const loading = ref(false)
const user = ref('');
const photo = ref('');
const countries = {
    loading: ref(false),
    all: ref([]),
    list: ref([]),
    options: ref([]),
};

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
const RegisterForm = useForm({
    name: '',
    phone: '',
    email: '',
    password: '',
    mobile_code: '',
    country: '',
    user_type: '',
    supplier: 0,
    gender: '',
});

const uploadPhoto = async (event) => {
    try {
        let d = confirm("Are you sure you want to update the profile picture ?")
        if (!d) return;
        photo.value = event.target.files[0]
        const formData = new FormData();
        formData.append('logo', photo.value)


        const response = await axios.post('upload', formData);
        if (response.data.message === 1) {
            $toast.success("profile picture updated successfully!", {position: 'top'})
            window.location.reload()
        }
    } catch (e) {
        console.log(e)
        $toast.error("Something went wrong!")
    }
}

const cancelBooking = async (rental) => {
    try {
        loading.value = true
        const response = await axios.post('/cancel/booking', rental);

        console.log(response.status)
        if (response.status) {
            $toast.warning('Rental has been Cancelled', {position: 'top'})
            getUser()
        }
        loading.value = false
    } catch (e) {

        loading.value = false
        $toast.error(e.response.data.message, {position: 'top'})
    }
}
const downloadFile = (response, filename) => {
    try {

        // It is necessary to create a new blob object with mime-type explicitly set
        // otherwise only Chrome works like it should
        var newBlob = new Blob([response], {type: 'application/pdf'})

        // IE doesn't allow using a blob object directly as link href
        // instead it is necessary to use msSaveOrOpenBlob
        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveOrOpenBlob(newBlob)
            return
        }

        // For other browsers:
        // Create a link pointing to the ObjectURL containing the blob.
        const data = window.URL.createObjectURL(newBlob)
        var link = document.createElement('a')
        link.style.display = 'none';
        link.href = data
        link.download = filename + '.pdf'
        document.body.appendChild(link);
        link.click()
        window.URL.revokeObjectURL(data)
    } catch (e) {
        console.log("Error: " , e)
    }
}
const downloadInvoice = async (rental) => {
    try {
        loading.value = true
        const response = await axios.get('/invoice/booking/' + rental.id, {responseType: 'blob'})
        downloadFile(response.data, 'file')
        console.log(response)

        loading.value = false
    } catch (e) {

        loading.value = false
        $toast.error(e.response.data.message, {position: 'top'})
    }

}
const updateReservation = (item_id) => {
    window.location.href = '/update-booking?booking_id=' + item_id
    // router.get('/update-booking/'+item_id)
}
const updatePhoto = () => {
    document.getElementById('profile_pic').click()
}

const getUser = async () => {
    try {
        loading.value = true
        const params = {};

        const response = await axios.get('/my-current-user-profile');
        user.value = response.data.data;
        RegisterForm.name = response.data.data.name
        RegisterForm.email = response.data.data.email
        RegisterForm.phone = response.data.data.phone_num
        RegisterForm.country = response.data.data.country
        console.log(user.value)
    } catch (error) {
        router.get('/')
    } finally {
        loading.value = false;
    }
}
const register = async () => {
    loading.value = true

    if (RegisterForm.gender === undefined || RegisterForm.gender === null || RegisterForm.gender.length === 0) {
        $toast.error("Please Select Mr/Mrs", {position: 'top'});
        loading.value = false
        return;
    }
    if (RegisterForm.name === undefined || RegisterForm.name === null || RegisterForm.name.length === 0) {
        $toast.error("Please Insert valid Name", {position: 'top'});
        loading.value = false
        return;
    }
    if (RegisterForm.email === undefined || RegisterForm.email === null || RegisterForm.email.length === 0) {
        $toast.error("Please Insert valid Email", {position: 'top'});
        loading.value = false

        return;
    }
    if (RegisterForm.phone === undefined || RegisterForm.phone === null || RegisterForm.phone.length === 0) {
        $toast.error("Please Insert valid Phone number", {position: 'top'});
        loading.value = false

        return;
    }
    if (RegisterForm.mobile_code === undefined || RegisterForm.mobile_code === null || RegisterForm.mobile_code.length === 0) {
        $toast.error("Please Insert valid Phone number", {position: 'top'});
        loading.value = false

        return;
    }
    if (RegisterForm.country === undefined || RegisterForm.country === null || RegisterForm.country.length === 0) {
        $toast.error("Please Insert Select Country", {position: 'top'});
        loading.value = false

        return;
    }
    if (RegisterForm.password === undefined || RegisterForm.password === null || RegisterForm.password.length === 0) {
        $toast.error("Please Insert valid Password", {position: 'top'});
        loading.value = false

        return;
    }
    return
    try {
        RegisterForm.name = RegisterForm.gender + ' ' + RegisterForm.name
        const response = await axios.post('/post/user/data', RegisterForm.data())
        if (response.data.status) {
            $toast.success('You Have Successfully Registered', {position: 'top'})
            setTimeout(function () {
                window.location.reload()
            }, 1000)
        }
    } catch ($error) {
        loading.value = false
        $toast.error($error.response.data.message, {position: 'top'})
    }
}

onMounted(() => {
    getUser()
})


</script>
<style>
.card {
    margin-bottom: 30px;
}

.overflow-hidden {
    overflow: hidden !important;
}

.p-0 {
    padding: 0 !important;
}

.mt-n5 {
    margin-top: -3rem !important;
}

.linear-gradient {
    background-image: linear-gradient(#50b2fc, #f44c66);
}

.rounded-circle {
    border-radius: 50% !important;
}

.align-items-center {
    align-items: center !important;
}

.justify-content-center {
    justify-content: center !important;
}

.d-flex {
    display: flex !important;
}

.rounded-2 {
    border-radius: 7px !important;
}

.bg-light-info {
    --bs-bg-opacity: 1;
    background-color: rgba(235, 243, 254, 1) !important;
}

.card {
    margin-bottom: 30px;
}

.position-relative {
    position: relative !important;
}

.shadow-none {
    box-shadow: none !important;
}

.overflow-hidden {
    overflow: hidden !important;
}

.border {
    border: 1px solid #ebf1f6 !important;
}

.fs-6 {
    font-size: 1.25rem !important;
}

.mb-2 {
    margin-bottom: 0.5rem !important;
}

.d-block {
    display: block !important;
}

a {
    text-decoration: none;
}

.user-profile-tab .nav-item .nav-link.active {
    color: #5d87ff;
    border-bottom: 2px solid #5d87ff;
}

.mb-9 {
    margin-bottom: 20px !important;
}

.fw-semibold {
    font-weight: 600 !important;
}

.fs-4 {
    font-size: 1rem !important;
}

.card, .bg-light {
    box-shadow: 0 20px 27px 0 rgb(0 0 0 / 5%);
}

.fs-2 {
    font-size: .75rem !important;
}

.rounded-4 {
    border-radius: 4px !important;
}

.ms-7 {
    margin-left: 30px !important;
}
</style>
