<template>
    <div class="card">
        <div class="card-body">
            <h2 class="mb-4">My Profile</h2>
            <div class="card">
                <div class="card-body">
                    <form @submit.prevent="upload">

                        <h3 v-if="supplier || activeSupplier || reviewing" class="mb-4">Manager info</h3>
                        <div class="formbold-mb-3">
                            <label class="formbold-form-label"> User Name </label>
                            <input v-model="name" class="formbold-form-input"
                                   required/>
                        </div>

                        <div class="formbold-mb-3">
                            <label class="formbold-form-label"> Email </label>
                            <input v-model="email" class="formbold-form-input disabled"
                                   required disabled/>
                        </div>

                        <div class="formbold-mb-3">
                            <label class="formbold-form-label"> Phone </label>
                            <input v-model="phone_num" type="text" class="formbold-form-input"
                                   required/>
                        </div>


                        <div v-if="customer" class="formbold-mb-3">
                            <label class="formbold-form-label">Gender</label>
                            <el-select
                                v-model="gender"
                                size="large"
                                placeholder="Gender..."
                                style="width: 100%;"
                            >
                                <el-option
                                    key="1"
                                    label="Male"
                                    value="Male"
                                />
                                <el-option
                                    key="2"
                                    label="Female"
                                    value="Female"
                                />
                            </el-select>
                        </div>

                        <div class="row">
                            <h3 v-if="supplier || activeSupplier || reviewing" class="mb-4 col-md-12">Company info</h3>

                            <div v-if="supplier || activeSupplier || reviewing" class="formbold-mb-3 col-md-6">
                                <label class="formbold-form-label">
                                    Company Logo
                                </label>
                                <input @change="handle" type="file"
                                       class="formbold-form-input formbold-form-file"/>
                            </div>

                            <div v-if="supplier || activeSupplier || reviewing || admin" class="formbold-mb-3 col-md-6">
                                <label class="formbold-form-label"> Company Name </label>
                                <input v-model="company" type="text" class="formbold-form-input"
                                       required/>
                            </div>

                            <div class="formbold-mb-3 col-md-6" v-if="supplier || activeSupplier">
                                <label class="formbold-form-label">Country</label>
                                <div class="countries">
                                    <el-select
                                        v-model="country"
                                        size="large"
                                        filterable
                                        placeholder="Pickup..."
                                        :loading="countries.loading.value"
                                        :on-change="getCities()"
                                        required>
                                        <el-option
                                            v-for="item in countries.list.value"
                                            :key="item.id"
                                            :label="item.label"
                                            :value="item.label"
                                            @click="fetchStates(item.iso)"
                                        />
                                    </el-select>
                                </div>
                            </div>
                            <div class="formbold-mb-3 col-md-6" v-if="supplier || activeSupplier">
                                <label class="formbold-form-label">City</label>
                                <div class="countries">
                                    <el-select
                                        v-model="city"
                                        size="large"
                                        filterable
                                        remote
                                        reserve-keyword
                                        placeholder="Pickup..."
                                        remote-show-suffix
                                        :remote-method="remoteCountries"
                                        :loading="countries.loading.value"
                                        required>
                                        <el-option
                                            v-for="item in cities.list.value"
                                            :key="item"
                                            :label="item.label"
                                            :value="item.value"
                                        />
                                    </el-select>
                                </div>
                            </div>

                            <div class="formbold-mb-3 col-md-6" v-if="supplier || activeSupplier">

                                <label class="formbold-form-label">Address</label>
                                <input v-model="address" type="text" placeholder="Address"
                                       class="formbold-form-input col-md-12"
                                       required/>
                            </div>
                            <div class="formbold-mb-3 col-md-6 mt-3" v-if="supplier || activeSupplier">
                                <label class="form bold-form-label">Language</label>
                                <div class="countries">
                                    <el-select
                                        v-model="language"
                                        size="large"
                                        filterable
                                        remote
                                        multiple
                                        reserve-keyword
                                        placeholder="Pickup..."
                                        remote-show-suffix
                                        :remote-method="remoteCountries"
                                        :loading="countries.loading.value"
                                        required>
                                        <el-option
                                            v-for="item in [{label: 'Arabic'},{label: 'English'},{label: 'French'}]"
                                            :key="item.label"
                                            :label="item.label"
                                            :value="item.label"
                                            @click="fetchStates(item.iso)"
                                        />
                                    </el-select>
                                </div>
                            </div>

                        </div>
                        <div class="text-center">
                            <button type="submit" class="btn btn-primary p-3">Submit</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import {onMounted, ref} from 'vue'
import {router} from "@inertiajs/vue3";
import {useToast} from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';
const logo = ref('');
const image = ref('');
const name = ref('');
const email = ref('');
const country = ref('');
const city = ref('');
const phone_num = ref('');
const address = ref('');
const language = ref('');
const oldPass = ref('');
const newPass = ref('');
const confirmNewPass = ref('');
const company = ref('');
const countries = {
    loading: ref(false),
    all: ref([]),
    list: ref([]),
    options: ref([]),
};
const $toast = useToast();

const cities = {
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
const states = {
    loading: ref(false),
    all: ref([]),
    list: ref([]),
    options: ref([]),
};

const gender = ref('');
const role = ref('')
const admin = ref(false)
const activeSupplier = ref(false)
const supplier = ref(false)
const customer = ref(false)
const reviewing = ref(false)
const formStatus = ref(true)
const addBranch = ref(false);
const newBranch = ref({
    name: '',
    country: '',
    city: '',
    state: '',
    phone: '',
    email: '',
    abriviation: '',
    address: '',
    currency: '',
    lat: '',
    lng: ''
});

const branches = ref([])

const currencies = {
    loading: ref(false),
    all: ref([]),
    list: ref([]),
    options: ref([]),
}
const fuelPolicies = {
    loading: ref(false),
    all: ref([]),
    list: ref([]),
    options: ref([]),
}

const onAddItem = () => {
    addBranch.value = true;
};

const fetchBranches = async () => {
    try {
        const response = await axios.get('get/branches');
        branches.value = response.data
    } catch (error) {
        console.error(error);
    }
};

const uploadBranch = async () => {
    newBranch.value.location = `${newBranch.value.country}, ${newBranch.value.city}, (${newBranch.value.abriviation.toUpperCase()})`;
    newBranch.value.adresse = newBranch.value.address
    try {
        const response = await axios.post('upload/branch', newBranch.value);
        if (response.data.message === 0) {
            formStatus.value = false;
        } else {
            formStatus.value = true;
        }
        open();
        fetchBranches();
    } catch (error) {
        console.error(error);
    } finally {
        newBranch.value.name = '';
        newBranch.value.country = '';
        newBranch.value.state = '';
        newBranch.value.city = '';
        newBranch.value.email = '';
        newBranch.value.phone = '';
        newBranch.value.abriviation = '';
        newBranch.value.abriviation = '';
        newBranch.value.currency = '';
        newBranch.value.lat = '';
        newBranch.value.lng = '';

        newBranch.value.adresse = '';
        newBranch.value.location = '';

        addBranch.value = false;
    }
};

const cancelAddItem = () => {
    newBranch.value = {
        name: '',
        country: '',
        state: '',
        abriviation: '',
        address: '',
    };
    addBranch.value = false;
};

const deleteRow = async (index, row) => {
    try {
        const response = await axios.post('delete/branches', row);
        branches.value = response.data;
    } catch (error) {
        console.error(error);
    }
}

const open = () => {
    console.log(formStatus)
    if (formStatus.value === true) {
        $toast.success("branch created successfully.", {position: "top"})
    } else {
        $toast.error("branch not created.", {position: "top"})
    }
}

const getRole = async () => {
    try {
        const response = await axios.get('get/user/role');
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

const handle = (event) => {
    image.value = event.target.files[0]
}

const getUserData = async () => {
    try {
        const response = await axios.get('/get/user/data');
        logo.value = response.data.logo ? response.data.logo : '';
        name.value = response.data.name ? response.data.name : '';
        email.value = response.data.email ? response.data.email : '';
        country.value = response.data.country ? response.data.country : '';
        address.value = response.data.address ? response.data.address : '';
        phone_num.value = response.data.phone_num ? response.data.phone_num : '';
        language.value = response.data.language ? response.data.language : '';
        company.value = response.data.company ? response.data.company : '';
        gender.value = response.data.gender ? response.data.gender : '';
        city.value = response.data.city ? response.data.city : '';
        if (response.data.role == 'customer') {
            router.get('/')
        }
    } catch (error) {
        console.error(error);
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

const fetchCurrencies = async () => {
    currencies.loading.value = true;
    try {
        //
        const response = await axios.get('get/currencies', {})
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

const fetchStates = async (iso) => {
    // states.loading.value = true
    try {
        // const response = await axios.get(`https://api.countrystatecity.in/v1/countries/${iso}/states`, {
        //     headers: {
        //         'X-CSCAPI-KEY': 'NVZhakViaFdtOXBJZ0xoQW1lWkJGTmlGUW1Kb05XaElGbXhocnNNOA=='
        //     }
        // })
        // states.all.value = response.data
        // states.list.value = states.all.value.map((item) => ({
        //     value: `${item.id}`,
        //     label: `${item.name}`,
        // }))
    } catch (error) {
        console.error(error)
    } finally {
        // states.loading.value = false
    }
}

const remoteStates = (query) => {
    if (query) {
        states.loading.value = true
        setTimeout(() => {
            states.loading.value = false
            states.options.value = states.list.value.filter((item) =>
                item.label.toLowerCase().includes(query.toLowerCase())
            )
        }, 200)
    } else {
        states.options.value = []
    }
}

const upload = async () => {
    const formData = new FormData();
    if (image.value) {
        formData.append('logo', image.value);
    }
    if (name.value) {
        formData.append('name', name.value);
    }
    if (country.value) {
        formData.append('country', country.value);
    }
    if (city.value) {
        formData.append('city', city.value);
    }
    if (email.value) {
        formData.append('email', email.value);
    }
    if (phone_num.value) {
        console.log(phone_num.value)
        formData.append('phone_num', phone_num.value);
    }
    if (oldPass.value) {
        formData.append('oldPass', oldPass.value);
    }
    if (newPass.value) {
        formData.append('newPass', newPass.value);
    }
    if (confirmNewPass.value) {
        formData.append('confirmNewPass', confirmNewPass.value);
    }
    if (company.value) {
        formData.append('company', company.value);
    }
    if (gender.value) {
        formData.append('gender', gender.value);
    }
    if (address.value) {
        formData.append('address', address.value);
    }
    if (language.value) {
        formData.append('language', language.value);
    }

    try {
        const response = await axios.post('upload', formData);
        if (response.data.message === 0) {
            formStatus.value = false;
        } else {
            formStatus.value = true;
        }
        open();
        // getUserData();
    } catch (error) {
        console.error(error);
    } finally {
        oldPass.value = null;
        newPass.value = null;
        confirmNewPass.value = null;
    }
}

onMounted(() => {
    getUserData();
    getRole();
    fetchCountries();
    fetchBranches();
    fetchCurrencies()
});

</script>

<style scoped>
.formbold-form-input.disabled {
    background: rgba(128, 128, 128, 0.1);
    color: rgba(0, 0, 0, 0.3);
}

:deep(.el-dialog__header) {
    background: transparent;
}

:deep(.el-dialog__body) {
    padding-top: 80px;
}

</style>
