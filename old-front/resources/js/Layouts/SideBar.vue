<template>

    <aside class="left-sidebar flex-column mb-sm-auto mb-0 align-items-center align-items-sm-start">
        <div>
            <div class="brand-logo d-flex align-items-center justify-content-between pt-3">
                <div class="profile_avatar">

                    <a v-if="supplier || activeSupplier || reviewing && user.logo !== null"
                       class="text-nowrap logo-img">
                        <img :src="'/' + user.logo ? '/img/' + user.logo : ''" alt="logo" width="180">
                    </a>
                    <a v-else-if=" admin " class="text-nowrap logo-img">
                        <img src="/images/logo_white.png" alt="logo" width="180">
                    </a>

                    <div class="profile_name">
                        <h4>
                            {{ user.company }}
                            <span class="profile_username text-gray"> {{ user.email }}</span>
                        </h4>
                    </div>
                </div>
            </div>
            <nav class="sidebar-nav scroll-sidebar" data-simplebar="">
                <ul id="sidebarnav">
                    <li class="nav-small-cap">
                        <i class="ti ti-dots nav-small-cap-icon fs-4"></i>
                        <span class="hide-menu"></span>
                    </li>
                    <li class="sidebar-item">
                        <a :class="  ['sidebar-link', isActive('index') ? 'active' : '']" href="/index"
                           aria-expanded="false">
                                               <span>
                                                  <i class="ti ti-layout-dashboard"></i>
                                              </span>
                            <span class="hide-menu">Dashboard</span>
                        </a>
                    </li>
                    <li class="sidebar-item">
                        <a :class="  ['sidebar-link', isActive('company') ? 'active' : '']" href="/company"
                           aria-expanded="false">
                            <span><i class="ti ti-user-circle"></i></span>
                            <span class="hide-menu">My Profile</span>
                        </a>
                    </li>
                    <li class="sidebar-item" v-if="admin">
                        <a :class="  ['sidebar-link', isActive('companies') ? 'active' : '']" href="/companies"
                           aria-expanded="false">
                            <span><i class="ti ti-building-store"></i></span>
                            <span class="hide-menu">My Companies</span>
                        </a>
                    </li>
                    <li class="sidebar-item" v-if="admin">
                        <a :class="  ['sidebar-link', isActive('blogs') ? 'active' : '']" href="/admin/blogs"
                           aria-expanded="false">
                            <span><i class="ti ti-book"></i></span>
                            <span class="hide-menu">Blogs</span>
                        </a>
                    </li>
                    <li class="sidebar-item" v-if="admin">
                        <a :class="  ['sidebar-link', isActive('/admin/blogs/categories') ? 'active' : '']" href="/admin/blogs/categories"
                           aria-expanded="false">
                            <span><i class="ti ti-folder"></i></span>
                            <span class="hide-menu">Blog Categories</span>
                        </a>
                    </li>
                    <li class="sidebar-item" v-if="activeSupplier">
                        <a :class="  ['sidebar-link', isActive('branches') ? 'active' : '']" href="/branches"
                           aria-expanded="false">
                            <span><i class="ti ti-building-store"></i></span>
                            <span class="hide-menu">My Branches</span>
                        </a>
                    </li>
                    <li class="sidebar-item" v-if="activeSupplier">
                        <a :class="  ['sidebar-link', isActive('payment') ? 'active' : '']" href="/supplier/payment_methods">
                            <i class="ti ti-credit-card"></i>
                            <span>Payment Methods</span></a>
                    </li>
                    <div v-if="admin">
                        <li class="sidebar-item">
                            <a :class="  ['sidebar-link', isActive('margin') ? 'active' : '']" href="/margin">
                                <i class="ti ti-zoom-money"></i>
                                <span>Profit Margin</span></a>
                        </li>


                        <!---->
                        <li class="sidebar-item">
                            <a :class="  ['sidebar-link', isActive('photos') ? 'active' : '']" href="/photos">
                                <i class="ti ti-photo"></i>
                                <span>Vehicles Photos</span></a>
                        </li>

                        <li class="sidebar-item">
                            <a :class="  ['sidebar-link', isActive('vehicles-bulk-upload') ? 'active' : '']" href="/vehicles-bulk-upload">
                                <i class="ti ti-upload"></i>
                                <span>Vehicles Bulk Upload</span></a>
                        </li>

                        <li class="sidebar-item">
                            <a :class="  ['sidebar-link', isActive('categories') ? 'active' : '']" href="/categories">
                                <i class="ti ti-category"></i>
                                <span>Categories</span></a>
                        </li>
                        <li class="sidebar-item">
                            <a :class="  ['sidebar-link', isActive('specifications') ? 'active' : '']"
                               href="/specifications">
                                <i class="ti ti-car-turbine"></i>
                                <span>Specifications</span></a>
                        </li>
                        <li class="sidebar-item">
                            <a :class="  ['sidebar-link', isActive('memberships') ? 'active' : '']" href="/memberships">
                                <i class="ti ti-key" aria-hidden="true"></i>
                                <span>Memberships</span></a>
                        </li>
                        <!--                        <li class="sidebar-item">-->
                        <!--                            <a :class="  ['sidebar-link', isActive('photos') ? 'active' : '']" href="/vehicles">-->
                        <!--                                <i class="ti ti-car" aria-hidden="true"></i>-->
                        <!--                                <span>Vehicles</span></a>-->
                        <!--                        </li>-->
                    </div>
                    <div v-if="activeSupplier">
                        <li class="sidebar-item">
                            <a :class="  ['sidebar-link', isActive('vehicle') ? 'active' : '']" href="/vehicle">
                                <span><i class="ti ti-car-crash"></i></span>
                                <span>Crete a Vehicle</span></a>
                        </li>
                        <li class="sidebar-item">
                            <a :class="  ['sidebar-link', isActive('price-list') ? 'active' : '']" href="/price-list">
                                <span><i class="ti ti-zoom-money"></i></span>
                                <span>Price List</span></a>
                        </li>
                        <li class="sidebar-item">
                            <a :class="  ['sidebar-link', isActive('vehicles') ? 'active' : '']" href="/vehicles">
                                <span><i class="ti ti-car"></i></span>

                                <span>My Vehicles</span></a>
                        </li>
                    </div>

                    <div v-if="supplier || activeSupplier || reviewing">
                        <li class="sidebar-item active">
                            <a :class="  ['sidebar-link', isActive('membership') ? 'active' : '']" href="/membership">
                                <i class="ti ti-gift-card" aria-hidden="true"></i>
                                <span>Membership</span></a>
                        </li>
                    </div>

                    <li class="sidebar-item " v-if="admin">
                        <a :class="  ['sidebar-link', isActive('customers') ? 'active' : '']" href="/customers">
                            <i class="ti ti-users" aria-hidden="true"></i>
                            <span>Customers</span></a>
                    </li>

                    <ul class="sidebar-item " v-if="admin" @click="openChild('rentals')">
                        <a :class="  ['sidebar-link', isActive('rentals') ? 'active' : '']" href="#">
                            <i class="ti ti-receipt" aria-hidden="true"></i>
                            <span>Rentals</span></a>
                    </ul>

                    <li class="ml-5 sidebar-item child-item-rentals display-none" v-if="admin">
                        <a :class="  ['sidebar-link', isActive('rentals/admin') ? 'active' : '']" href="/rentals/admin">
                            <i class="ti ti-paper-bag" aria-hidden="true"></i>
                            <span>All Rentals</span></a>
                    </li>
                    <li class="ml-5 sidebar-item child-item-rentals display-none" v-if="admin">
                        <a :class="  ['sidebar-link', isActive('rentals/admin') ? 'active' : '']"
                           href="/rentals/admin?status=2">
                            <i class="ti ti-checks" aria-hidden="true"></i>
                            <span>Confirmed</span></a>
                    </li>
                    <li class="ml-5 sidebar-item child-item-rentals display-none" v-if="admin">
                        <a :class="  ['sidebar-link', isActive('rentals/admin') ? 'active' : '']"
                           href="/rentals/admin?status=4">
                            <i class="ti ti-loader" aria-hidden="true"></i>
                            <span>Pending</span></a>
                    </li>
                    <li class="ml-5 sidebar-item child-item-rentals display-none" v-if="admin">
                        <a :class="  ['sidebar-link', isActive('rentals/admin') ? 'active' : '']"
                           href="/rentals/admin?status=3">
                            <i class="ti ti-forbid" aria-hidden="true"></i>
                            <span>Canceled</span></a>
                    </li>

                    <ul class="sidebar-item parent-item" v-if="activeSupplier" @click="openChild('rentals')">
                        <a :class="  ['sidebar-link', isActive('rentals/supplier') ? 'active' : '']"
                           href="/rentals/supplier">
                            <i class="ti ti-receipt" aria-hidden="true"></i>
                            <span>Rentals</span></a>
                    </ul>


                    <li class="sidebar-item" v-if="supplier || activeSupplier">
                        <a :class="  ['sidebar-link', isActive('supplier-rental-terms') ? 'active' : '']"
                           href="/supplier-rental-terms">
                            <i class="ti ti-list" aria-hidden="true"></i>
                            <span>My Rental Terms</span></a>
                    </li>
                    <li class="sidebar-item" v-if="supplier || activeSupplier">
                        <a :class="  ['sidebar-link', isActive('promos') ? 'active' : '']" href="/promos">
                            <i class="ti ti-gift" aria-hidden="true"></i>
                            <span>Promos</span></a>
                    </li>
                    <li class="sidebar-item" v-if="supplier || activeSupplier">
                        <a :class="  ['sidebar-link', isActive('reviews') ? 'active' : '']" href="/reviews">
                            <i class="ti ti-check" aria-hidden="true"></i>
                            <span>Rental Reviews</span></a>
                    </li>
                    <li class="sidebar-item" v-if="admin">
                        <a :class="  ['sidebar-link', isActive('admin-reviews') ? 'active' : '']" href="/admin-reviews">
                            <i class="ti ti-check" aria-hidden="true"></i>
                            <span>Rental Reviews</span></a>
                    </li>

                    <li class="sidebar-item" v-if="admin">
                        <a :class="  ['sidebar-link', isActive('rental-terms') ? 'active' : '']" href="/rental-terms">
                            <i class="ti ti-list" aria-hidden="true"></i>
                            <span>Rental Terms</span></a>
                    </li>

                    <li class="sidebar-item " v-if="admin">
                        <a :class="  ['sidebar-link', isActive('included') ? 'active' : '']" href="/included">
                            <i class="ti ti-feather" aria-hidden="true"></i>
                            <span>What is included ?</span></a>
                    </li>
                    <li class="sidebar-item " v-if="admin">
                        <a :class="  ['sidebar-link', isActive('subscribers') ? 'active' : '']" href="/subscribers">
                            <i class="ti ti-mail" aria-hidden="true"></i>
                            <span>Subscribers</span></a>
                    </li>
                    <li class="sidebar-item " v-if="admin">
                        <a :class="  ['sidebar-link', isActive('background-settings') ? 'active' : '']" href="/admin/background-settings">
                            <i class="ti ti-photo" aria-hidden="true"></i>
                            <span>Background Settings</span></a>
                    </li>

                    <li class="sidebar-item">
                        <a :class="  ['sidebar-link', isActive('') ? 'active' : '']" href="/logout">
                            <i class="ti ti-logout" aria-hidden="true"></i>
                            <span>Sign Out</span></a>

                    </li>
                </ul>
            </nav>
        </div>
    </aside>

</template>

<script setup>
import '../../css/bootstrap.min.css'

import '../../css/dashboard.css'
import '../../css/scheme.css'
import '../../css/coloring.css'
import '../../css/app.css'

import {Link} from '@inertiajs/vue3'
import {onMounted, ref} from 'vue'

const user = ref('')
const role = ref('')
const admin = ref(false)
const activeSupplier = ref(false)
const supplier = ref(false)
const customer = ref(false)
const reviewing = ref(false)

const openChild = async (menu_name) => {
    console.log(menu_name)
    $('.child-item-' + menu_name).toggle()
}
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

const isActive = (name) => {
    const path = window.location.pathname;
    if (name.startsWith('/')) {
        return path === name;
    }
    return path.split('/').pop() === name;
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
