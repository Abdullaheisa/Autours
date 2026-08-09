<template>


    <div class="card">
        <div class="card-body">
            <h2 class="mb-4">Edit Branches</h2>
            <div class=" justify-content-center col-md-12">
                <div v-if="!loading" class="row">
                    <div class="formbold-mb-3 col-md-3">
                        <label class="formbold-form-label">Name</label>
                        <el-input v-model="newBranch.name" required/>
                    </div>
                    <div class="formbold-mb-3 col-md-3">
                        <label class="formbold-form-label">email</label>
                        <el-input v-model="newBranch.email" required/>
                    </div>
                    <div class="formbold-mb-3 col-md-3">
                        <label class="formbold-form-label">Phone</label>
                        <el-input v-model="newBranch.phone" required/>
                    </div>

                    <div class="formbold-mb-3">
                        <label class="formbold-form-label ml-2">Branch Address Details</label>
                        <div class="countries">
                            <el-select
                                v-model="newBranch.country"
                                size="large"
                                class="col-md-3"
                                filterable
                                placeholder="Country..."
                                :loading="countries.loading.value"
                                required
                            >
                                <el-option
                                    v-for="item in countries.list.value"
                                    :key="item.id"
                                    :label="item.label"
                                    :value="item.label"

                                />
                            </el-select>
                            <el-select
                                v-model="newBranch.city"
                                size="large"
                                filterable
                                remote
                                class="col-md-3"

                                reserve-keyword
                                placeholder="City..."
                                remote-show-suffix
                                :remote-method="remoteCountries"
                                :loading="branchCities.loading.value"
                                @click="getCitiesForBranches()"
                                required>
                                <el-option
                                    v-for="item in branchCities.list.value"
                                    :key="item.id"
                                    :label="item.label"
                                    :value="item.label"
                                />
                            </el-select>
                            <el-select
                                v-model="newBranch.pickup_type"
                                size="large"
                                filterable
                                class="col-md-3"
                                remote
                                reserve-keyword
                                placeholder="location type..."
                                remote-show-suffix
                                required>
                                <el-option
                                    v-for="item in location_types"
                                    :key="item.name"
                                    :label="item.name"
                                    :value="item.name"
                                />
                            </el-select>

                            <div class="formbold-mb-3">

                                <div class="input-with-percent">
                                    <input v-model="newBranch.abriviation" maxlength="3" type="text"
                                           placeholder="Abbreviations"
                                           style="padding: 6px 22px; text-transform: uppercase;"

                                           class="formbold-form-input " required/>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="formbold-mb-3 col-md-6" v-if="supplier || activeSupplier">
                        <label class="formbold-form-label">Currency</label>
                        <div class="countries">
                            <el-select
                                v-model="newBranch.currency"
                                size="large"
                                filterable
                                remote
                                reserve-keyword
                                placeholder="Currency..."
                                remote-show-suffix
                                :loading="currencies.loading.value"
                                required>
                                <el-option
                                    v-for="item in currencies.list.value"
                                    :key="item"
                                    :label="item.label"
                                    :value="item.value"
                                />
                            </el-select>
                        </div>
                    </div>
                    <div class="row">
                        <div class="formbold-mb-3 col-md-2">
                            <label class="formbold-form-label">Latitude</label>
                            <input v-model="newBranch.lat" class="form-control"/>
                        </div>
                        <div class="formbold-mb-3 col-md-2">
                            <label class="formbold-form-label">Longitude</label>
                            <input v-model="newBranch.lng" class="form-control"/>
                        </div>
                    </div>
                    <div class="formbold-mb-3 col-md-8">
                        <label class="formbold-form-label">Address</label>
                        <textarea v-model="newBranch.adresse" class="form-control" rows="5"
                                  required></textarea>
                    </div>


                    <el-form-item>
                        <div class="row">
                            <div class="col-md-3">
                                <el-button type="primary" @click="editBranch">Save Branch</el-button>
                            </div>
                            <div class="col-md-3">
                                <el-button class="btn btn-danger" @click="cancel">Cancel</el-button>
                            </div>
                        </div>

                    </el-form-item>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import {onMounted, computed, ref} from 'vue'

import {useToast} from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';
import {router} from "@inertiajs/vue3";

const search = ref('')
const tableData = ref([])
const loading = ref(false)
const isOpen = ref(false)
const id = ref({})
const role = ref('')
const activeSupplier = ref(false)
const supplier = ref(false)

const $toast = useToast()
const newBranch = ref({
    name: '',
    country: '',
    city: '',
    state: '',
    phone: '',
    email: '',
    abriviation: '',
    pickup_type: '',
    address: '',
    currency: '',
    lat: '',
    lng: ''
});

const location_types = [
    {
        name: 'Airport',
        icon: 'plan-departure'
    },
    {
        name: 'Hotel',
        icon: 'hotel'
    },
    {
        name: 'Downtown',
        icon: 'building'
    }];
const states = {
    loading: ref(false),
    all: ref([]),
    list: ref([]),
    options: ref([]),
};


const branchCities = {
    loading: ref(false),
    all: ref([]),
    list: ref([]),
    options: ref([]),
};
const countries = {
    loading: ref(false),
    all: ref([]),
    list: ref([]),
    options: ref([]),
};

const cities = {
    loading: ref(false),
    all: ref([]),
    list: ref([]),
    options: ref([]),
};

const currencies = {
    loading: ref(false),
    all: ref([]),
    list: ref([]),
    options: ref([]),
}

const getBranch = async () => {
    try {
        loading.value = true
        const resp = await axios.get('/branches/edit/' + id.value)
        newBranch.value = resp.data.data
        newBranch.value.pickup_type = resp.data.data.location_type
        loading.value = false
        console.log(resp.data)
    } catch (e) {
        loading.value = false
        console.log(e)
    }
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

const editBranch = async () => {
    try {
        if (newBranch.value.pickup_type === 'Airport') {
            if ( newBranch.value.abriviation === null || newBranch.value.abriviation === [] || newBranch.value.abriviation === '' || newBranch.value.abriviation.length !== 3) {
                $toast.error('please enter a valid abbreviation', {position: "top"})
                return
            }
        }
        let abb = newBranch.value.pickup_type === 'Airport' ? newBranch.value.abriviation : newBranch.value.pickup_type
        newBranch.value.location = `${newBranch.value.country}, ${newBranch.value.city}, (${abb})`;
        const response = await axios.post('/branches/update', newBranch.value);
        console.log(response)
        if (response.data.status) {
            $toast.success('Branch updated successfully', {position: 'top'})
        }
    } catch (e) {
        $toast.error('Something went wrong', {position: 'top'})

        console.log(e)
    }
}
const cancel = () => {
    router.get('/branches')
}
const fetchCurrencies = async () => {
    currencies.loading.value = true;
    try {
        //
        const response = await axios.get('/get/currencies', {})
        currencies.all.value = response.data
        currencies.list.value = currencies.all.value.map((item) => ({
            id: `${item.id}`,
            label: `${item.name}`,
            value: `${item.name}`,
        }))
    } catch (error) {
        console.error(error)
    } finally {
        currencies.loading.value = false;
    }
}


const getCitiesForBranches = async () => {
    try {
        if (newBranch.value.country) {
            branchCities.loading.value = true
            console.log("-------------> ")
            console.log(newBranch)
            if (newBranch.value.country) {
                const response = await axios.post(`https://countriesnow.space/api/v0.1/countries/cities`, {
                    'country': newBranch.value.country
                })
                branchCities.all.value = response.data.data
                branchCities.list.value = branchCities.all.value.map((item) => ({
                    value: `${item}`,
                    label: `${item}`,
                }))
            }
        }
    } catch (error) {
        console.error(error)
    } finally {
        branchCities.loading.value = false
    }
}

const getCities = async () => {
    try {
        cities.loading.value = true
        if (country.value) {
            const response = await axios.post(`https://countriesnow.space/api/v0.1/countries/cities`, {
                'country': country.value
            })
            cities.all.value = response.data.data
            console.log(response.data)
            cities.list.value = cities.all.value.map((item) => ({
                value: `${item}`,
                label: `${item}`,
            }))
        }
    } catch (error) {
        console.error(error)
    } finally {
        cities.loading.value = false
    }
}

onMounted(async () => {
        let urlParams = new URLSearchParams(window.location.search);

        if (urlParams.has('id')) {
            id.value = await urlParams.get('id')
        }
        await getBranch();
        await getRole()
        await fetchCurrencies()
        await fetchCountries()
    }
)
</script>
<style>

.modal-mask {
    position: fixed;
    z-index: 9998;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
}

.modal-container {
    width: 900px;
    margin: 5% 25%;
    padding: 20px 30px;
    background-color: #fff;
    border-radius: 2px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
}
</style>
