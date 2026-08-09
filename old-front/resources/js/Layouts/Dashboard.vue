<template>
    <body>
    <div class="page-wrapper" id="main-wrapper" data-layout="vertical" data-navbarbg="skin6" data-sidebartype="full"
         data-sidebar-position="fixed" data-header-position="fixed">
        <side-bar/>
        <div class="body-wrapper">
            <dashboard-header/>
                <div class="row">
                    <slot/>
                </div>
        </div>
        <a href="#" id="back-to-top"></a>
    </div>
    </body>
</template>

<script setup>
import '../../css/bootstrap.min.css'

import '../../css/dashboard.css'
import '../../css/scheme.css'
import '../../css/coloring.css'
import '../../css/app.css'

import {Link} from '@inertiajs/vue3'
import {onMounted, ref} from 'vue'
import HeaderOne from '../components/HeaderOne.vue'
import SideBar from "./SideBar.vue";
import DashboardHeader from "../components/DashboardHeader.vue";

const user = ref('')
const role = ref('')
const admin = ref(false)
const activeSupplier = ref(false)
const supplier = ref(false)
const customer = ref(false)
const reviewing = ref(false)

const getRole = async () => {
    try {
        const response = await axios.get('/get/user/role');
        role.value = response.data;
    } catch (error) {
        console.error(error);
    } finally {
        if (role.value === 'admin') {
            admin.value = true
        } else if (role.value === 'active_supplier') {
            activeSupplier.value = true
        } else if (role.value === 'supplier') {
            supplier.value = true
        } else if (role.value === 'customer') {
            customer.value = true
        } else if (role.value === 'reviewing') {
            reviewing.value = true
        }
    }
}

const getUser = async () => {
    try {
        const response = await axios.get('/get/user/data');
        user.value = response.data;
    } catch (error) {
        console.error(error);
    }
}

onMounted(() => {
    getRole();
    getUser();
})
</script>

<style>
header {
    width: 100%;
    position: absolute;
    padding: 1rem 10%;
    border-bottom: none;
}
</style>
