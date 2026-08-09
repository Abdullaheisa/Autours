<template>
    <div class="card">
        <div class="card-body">
            <h3 class="card-title fw-semibold mb-4">Edit Vehicle </h3>
            <div class="card">
                <div class="card-body">
                    <form @submit.prevent="upload">
                        <div class="row mb-5">
                            <h4>Car Details</h4>
                            <div class="mb-3 mt-4 col-12">
                                <label class="formbold-form-label">Vehicle Photo</label>
                                <div class="display-none " style="color: red;" id="photo">
                                    <li>Please select Photo</li>
                                </div>
                                <el-select
                                    v-model="photo"
                                    size="large"
                                    filterable
                                    remote

                                    reserve-keyword
                                    placeholder="Photo..."
                                    remote-show-suffix
                                    :remote-method="remotePhotos"
                                    :loading="photos.loading.value"
                                    @click="remotePhotos()"
                                >
                                    <el-option
                                        :key="null"
                                        :label="null"
                                        :value="null"
                                    >
                                        <div class="d-flex" style="gap:10px; margin: 2px;">Select Photo..</div>
                                    </el-option>
                                    <el-option
                                        v-for="item in photos.list.value"
                                        :key="item.id"
                                        :label="item.label"
                                        :value="item.photo"
                                    >
                                        <div class="d-flex" style="gap:10px;">
                                            <img :src="'/img/vehicles/' + item.photo" style="width:50px;">
                                            {{ item.label }}
                                        </div>
                                    </el-option>
                                </el-select>
                                <div class="col-4 mt-5">
                                    <img v-if="photo" :src="'/img/vehicles/' + photo" class="mb-4 col-12" width="300"
                                         height="300">
                                </div>
                            </div>
                            <div class="formbold-mb-3 col-md-3">
                                <label class="formbold-form-label"> Vehicle Name </label>
                                <div class="display-none " style="color: red;" id="name">
                                    <li>Vehicle Name is required</li>
                                </div>
                                <input v-model="name" type="text" class="formbold-form-input"/>
                            </div>
                            <div class="formbold-mb-3 col-3">
                                <label class="formbold-form-label col-12">Pickup Location</label>
                                <div class="display-none " style="color: red;" id="pickupLoc">
                                    <li>Please select Pickup location</li>
                                </div>
                                <div class="countries">
                                    <el-select
                                        v-model="pickupLoc"
                                        size="large"
                                        class="col-12"
                                        filterable
                                        remote
                                        reserve-keyword
                                        placeholder="Pickup..."

                                        remote-show-suffix
                                        :remote-method="remoteBranches"
                                        :loading="locations.loading.value"
                                        @click="remoteBranches()"
                                    >
                                        <el-option
                                            v-for="item in locations.options.value"
                                            :key="item.id"
                                            :label="item.label"
                                            :value="item.label"
                                        />
                                    </el-select>

                                </div>
                            </div>
                            <div class="formbold-mb-3 col-3">
                                <label class="formbold-form-label col-12">Category</label>
                                <div class="display-none " style="color: red;" id="category">
                                    <li>Please select Category</li>
                                </div>
                                <el-select
                                    v-model="category"
                                    size="large"
                                    class="col-12"
                                    filterable
                                    remote
                                    reserve-keyword
                                    placeholder="Pickup..."
                                    remote-show-suffix
                                    :remote-method="remoteCategories"
                                    :loading="categories.loading.value"
                                    @click="remoteCategories()"
                                >
                                    <el-option
                                        v-for="item in categories.list.value"
                                        :key="item.id"
                                        :label="item.label"
                                        :value="item.id"
                                        :aria-selected="item.label == category.value"
                                        aria-selected="true"
                                    />
                                </el-select>
                            </div>
                            <div class="formbold-mb-3 col-3">
                                <label class="formbold-form-label col-12">Location Types</label>
                                <div class="display-none " style="color: red;" id="category">
                                    <li>Please select Vehicle Location Type</li>
                                </div>
                                <el-select
                                    v-model="locationType"
                                    size="large"
                                    class="col-12"
                                    filterable
                                    remote
                                    reserve-keyword
                                    placeholder="Select Location Type..."
                                    remote-show-suffix
                                    :loading="locationTypes.loading.value"
                                >
                                    <el-option
                                        v-for="item in locationTypes?.list.value"
                                        :key="item.id"
                                        :label="item.label"
                                        :value="item.id"
                                    />
                                </el-select>
                            </div>
                            <div class="formbold-mb-3 col-3 " >
                                <label class="form bold-form-label">Fuel Policy</label>
                                <div class="countries">
                                    <el-select
                                        v-model="fuelPolicy"
                                        size="large"
                                        filterable
                                        placeholder="Select Fuel Policy..."
                                        :loading="fuelPolicies.loading.value"
                                        required>

                                        <el-option
                                            v-for="item in fuelPolicies.list.value"
                                            :key="item.label"
                                            :label="item.label"
                                            :value="item.id"
                                        />
                                    </el-select>
                                </div>
                            </div>
                            <div class="formbold-mb-3 mb-5  col-3">
                                <label class="formbold-form-label"> Reserve Without Confirmation </label>
                                <el-switch
                                    size="large"
                                    v-model="instantConfirmation"
                                />

                            </div>

                            <div class="formbold-mb-3 mb-5  col-12">
                                <label class="formbold-form-label"> Vehicle Description </label>
                                <div class="display-none " style="color: red;" id="description">
                                    <li>Vehicle Description is required</li>
                                </div>
                                <Editor v-model="description" class="col-6 "/>
                            </div>

                        </div>
                        <hr/>
                        <div class="row">
                            <h4>Prices Section </h4>
                            <div class="formbold-mb-3 col-4">
                                <label class="formbold-form-label">Price 1-2 days</label>
                                <div class="display-none " style="color: red;" id="price">
                                    <li>Price 1-2 days is required</li>
                                </div>
                                <div class="input-with-percent">
                                    <input v-model="price" type="text" pattern="[0-9]+([,.][0-9]+)?"
                                           class="formbold-form-input col-6"/>
                                </div>
                            </div>

                            <div class="formbold-mb-3 col-4">
                                <label class="formbold-form-label">3 - 7 Days Price</label>
                                <div class="display-none " style="color: red;" id="weekPrice">
                                    <li>Price 3-7 days is required</li>
                                </div>
                                <div class="input-with-percent">
                                    <input v-model="weekPrice" type="text" pattern="[0-9]+([,.][0-9]+)?"

                                           class="formbold-form-input col-6"
                                    />
                                </div>
                            </div>

                            <div class="formbold-mb-3 col-4">
                                <label class="formbold-form-label">8-30 Days Price</label>
                                <div class="display-none " style="color: red;" id="monthPrice">
                                    <li>Price 8-30 days is required</li>
                                </div>
                                <div class="input-with-percent">
                                    <input v-model="monthPrice" type="text" pattern="[0-9]+([,.][0-9]+)?"
                                           class="formbold-form-input col-6"
                                    />
                                </div>
                            </div>
                        </div>
                        <hr/>
                        <h4> What is included ? </h4>
                        <div class="row">
                            <div class="formbold-mb-3 col-6">
                                <div style="height: 250px;">
                                    <el-select
                                        v-model="selectedIncluded"
                                        size="large"
                                        filterable
                                        remote
                                        multiple
                                        class="col-5"
                                        reserve-keyword
                                        placeholder="Select features..."
                                        remote-show-suffix
                                        v-b-scrollspy
                                    >
                                        <div >
                                            <el-option
                                                v-for="item in included.list.value"
                                                :key="item.id"
                                                :label="item.label"
                                                :value="item.label"
                                            />
                                        </div>
                                    </el-select>
                                </div>
                            </div>
                        </div>
                        <hr/>
                        <h4> Specifications </h4>
                        <div class="row">
                            <div v-for="(list, i) in specifications" :key="i" class="formbold-mb-3 col-6">
                                <label class="formbold-form-label col-5">{{ list.name }} - <i
                                    :class="'fa fa-' + list.icon"/></label>
                                <select
                                    class="col-md-5 form-select"
                                    @click="getSpecificationOption(list.name,list.icon, $event)"
                                >
                                    <option
                                        value=""
                                    >
                                        -- No Option --
                                    </option>
                                    <option
                                        v-for="item in list.options"
                                        :value="item"
                                        :selected="list.selectedOption === item"

                                    >
                                        {{item}}
                                    </option>
                                </select>
                            </div>
                        </div>
                        <hr/>
                        <div style="height: 100px;"></div>

                        <div class="row justify-content-center">
                            <div class="col-md-2 ml-5">
                                <button type="submit" class="btn btn-primary p-3" style="color: #0a3622;">Submit
                                </button>
                            </div>
                            <div class="col-md-5">
                                <a href="/vehicles" class="btn btn-danger p-3">Cancel</a>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import {onMounted, ref, watchEffect} from 'vue'
import {router} from "@inertiajs/vue3";
import Editor from 'primevue/editor';

import {useToast} from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';

const $toast = useToast();
const photo = ref('')
const name = ref('')
const description = ref('')
const price = ref('')
const weekPrice = ref('')
const monthPrice = ref('')
const pickupLoc = ref('')
const locations = {
    loading: ref(false),
    all: ref([]),
    list: ref([]),
    options: ref([]),
};
const instantConfirmation = ref(false)
const locationTypes = {
    loading: ref(false),
    all: ref([]),
    list: ref([]),
    options: ref([]),
};
const category = ref('')
const locationType = ref({})
const fuelPolicy = ref();
const fuelPolicies = {
    loading: ref(false),
    all: ref([]),
    list: ref([]),
    options: ref([]),
}

const categories = {
    loading: ref(false),
    all: ref([]),
    list: ref([]),
    options: ref([]),
};
const selectedIncluded = ref([])

const included = {
    loading: ref(false),
    all: ref([]),
    list: ref([]),
    options: ref([]),
};

const specification = ref([])
const specifications = ref([])
const selectedSpecifications = ref([])
const vehicleSpecifications = ref([])
let vehicle = {};

const photos = {
    loading: ref(false),
    all: ref([]),
    list: ref([]),
    options: ref([]),
};

const getSpecificationOption = (name, icon, option) => {

    const s = {
        'name': name,
        'selectedOption': option.target.value,
        'icon': icon,
    }

        const isDuplicate = selectedSpecifications.value.some(item => (
            item?.name === name
        ));

        if (!isDuplicate) {
            if(option.target.value !== "") {
                selectedSpecifications.value.push(s);
            }
        } else {
           const existingItem = selectedSpecifications.value.find(item => item?.name === name);
            if (existingItem) {
                existingItem.selectedOption = s.selectedOption;
            }
        }

};

const fetchSpecifications = async () => {
    try {
        const response = await axios.get('/get/specifications');
        specifications.value = response.data;
    } catch (error) {
        console.error(error);
    } finally {

    }
}

const fetchCategories = async () => {
    categories.loading.value = true;
    try {
        const response = await axios.get('/get/categories')
        categories.all.value = response.data
        categories.list.value = categories.all.value.map((item) => ({
            id: `${item.id}`,
            label: `${item?.name}`,
        }))
    } catch (error) {
        console.error(error)
    } finally {
        categories.loading.value = false;
    }
}

const remoteCategories = (query) => {
    if (query) {
        categories.loading.value = true
        setTimeout(() => {
            categories.loading.value = false
            categories.options.value = categories.list.value.filter((item) =>
                item.label.toLowerCase().includes(query.toLowerCase())
            )
        }, 200)
    } else {
        categories.options.value = categories.list.value;
    }
}

const fetchBranches = async () => {
    locations.loading.value = true;
    try {
        const response = await axios.get('/get/branches')
        locations.all.value = response.data
        locations.list.value = locations.all.value.map((item) => ({
            id: `${item.id}`,
            label: `${item?.location}`,
        }))
    } catch (error) {
        console.error(error)
    } finally {
        locations.loading.value = false;
    }
}

const remoteBranches = (query) => {
    if (query) {
        locations.loading.value = true
        setTimeout(() => {
            locations.loading.value = false
            locations.options.value = locations.list.value.filter((item) =>
                item.label.toLowerCase().includes(query.toLowerCase())
            )
        }, 200)
    } else {
        locations.options.value = locations.list.value;
    }
}

const fetchPhotos = async () => {
    photos.loading.value = true;
    try {
        const response = await axios.get('/get/photos')
        photos.all.value = response.data
        photos.list.value = photos.all.value.map((item) => ({
            id: `${item.id}`,
            label: `${item?.name}`,
            photo: `${item.photo}`,
        }))
    } catch (error) {
        console.error(error)
    } finally {
        photos.loading.value = false;
    }
}

const remotePhotos = (query) => {
    if (query) {
        photos.loading.value = true
        setTimeout(() => {
            photos.loading.value = false
            photos.options.value = photos.list.value.filter((item) =>
                item.label.toLowerCase().includes(query.toLowerCase())
            )
        }, 200)
    } else {
        photos.options.value = photos.list.value;
    }
}

const validateForm = () => {
    let valid = true;
    if (price.value === '' || price.value === [] || price.value === null || price.value === undefined) {
        $('#price').show();
        valid = false;
    } else {
        $('#price').hide();
    }

    if (weekPrice.value === '' || weekPrice.value === [] || weekPrice.value === null || weekPrice.value === undefined) {
        $('#weekPrice').show();
        valid = false;
    } else {
        $('#weekPrice').hide();
    }

    if (monthPrice.value === '' || monthPrice.value === [] || monthPrice.value === null || monthPrice.value === undefined) {
        $('#monthPrice').show();
        valid = false;
    } else {
        $('#monthPrice').hide();
    }

    if (photo.value === '' || photo.value === [] || photo.value === null || photo.value === undefined) {
        $('#photo').show();
        valid = false;
    } else {
        $('#photo').hide();
    }
    if (name.value === '' || name.value === [] || name.value === null || name.value === undefined) {
        $('#name').show();
        valid = false;
    } else {
        $('#name').hide();
    }
    if (description.value === '' || description.value === [] || description.value === null || description.value === undefined) {
        $('#description').show();
        valid = false;
    } else {
        $('#description').hide();
    }
    if (category.value === '' || category.value === [] || category.value === null || category.value === undefined) {
        $('#category').show();
        valid = false;
    } else {
        $('#category').hide();
    }

    if (pickupLoc.value === '' || pickupLoc.value === [] || pickupLoc.value === null || pickupLoc.value === undefined) {
        $('#pickupLoc').show();
        valid = false;
    } else {
        $('#pickupLoc').hide();
    }
    return valid;
}


const upload = async () => {
    try {
        const formData = new FormData();
        formData.append('photo', photo.value);
        formData.append('name', name.value);
        formData.append('description', description.value);
        formData.append('price', price.value);
        formData.append('week_price', weekPrice.value);
        formData.append('month_price', monthPrice.value);
        formData.append('pickupLoc', pickupLoc.value);
       if(selectedSpecifications.value.length) {
           formData.append('specifications', JSON.stringify(selectedSpecifications.value));
       }
        formData.append('included', selectedIncluded.value);
        formData.append('update', '1');
        formData.append('instant_confirmation', instantConfirmation.value);
        formData.append('id', vehicle.id);
        if(!isNaN( locationType.value)) {
            formData.append('location_types', locationType.value);
        }
        if(!isNaN( fuelPolicy.value))
        formData.append('fuel_policy', fuelPolicy.value);

        if(!isNaN( category.value))
            formData.append('category', category.value);

        if (!validateForm()) return;

        console.log("====>")
        console.log(locationType.value)
        const response = await axios.post('/post/vehicles', formData);
        open(response.data);

        router.get('/vehicles')
    } catch (error) {
        console.log(error)
        $toast.error(error.response.data.message, {position: 'top'})
    }
}

const open = (response) => {
    if (response.status) {
        $toast.success('Your Vehicle Updated Successfully', {position: 'top'})
    } else {
        $toast.error(error.response.message, {position: 'top'})
    }
}
const getData = async () => {
    try {
        let urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');

        const response = await axios.get('/edit/vehicles/' + id);
        vehicle = response?.data?.data
        name.value = vehicle?.name
        pickupLoc.value = vehicle.branch?.location
        category.value = vehicle.category?.name
        description.value = vehicle.description
        price.value = vehicle.price
        weekPrice.value = vehicle.week_price
        monthPrice.value = vehicle.month_price
        specifications.value = vehicle.specifications
        selectedSpecifications.value = vehicle.specifications
        selectedIncluded.value = vehicle.what_is_included
        photo.value = vehicle.photo
        locationType.value = vehicle.location_type.length  ? vehicle.location_type[0]?.name : null
        fuelPolicy.value = vehicle.fuel_policy?.name
        instantConfirmation.value = vehicle.instant_confirmation === 1? true : false
    } catch (e) {
        console.log("=====error==>")
        console.log(e)
        $toast.error(e.response?.data?.message, {position: 'top'});
    }
}

const fetchFuelPolicies = async () => {
    fuelPolicies.loading.value = true;
    try {
        //
        const response = await axios.get('/get/fuel-policies', {})
        fuelPolicies.all.value = response.data
        fuelPolicies.list.value = fuelPolicies.all.value.map((item) => ({
            id: `${item.id}`,
            label: `${item?.name}`,
            value: `${item?.name}`,
        }))
    } catch (error) {
        console.error(error)
    } finally {
        fuelPolicies.loading.value = false;
    }
}
const fetchIncluded = async () => {
    included.loading.value = true;
    try {
        const response = await axios.get('/get/included')
        included.all.value = response.data
        included.list.value = included.all.value.map((item) => ({
            id: `${item.id}`,
            label: `${item.what_is_included}`,
        }))
    } catch (error) {
        console.error(error)
    } finally {
        included.loading.value = false;
    }
}
const fetchLocationTypes = async () => {
    locationTypes.loading.value = true;
    try {
        const response = await axios.get('/get/location-types')
        locationTypes.all.value = response.data.data
        locationTypes.list.value = locationTypes.all.value?.map((item) => ({
            id: `${item.id}`,
            label: `${item?.name}`,
            photo: `${item?.name}`,
        }))

    } catch (error) {
        console.error(error)
    } finally {
        locationTypes.loading.value = false;
    }
}
onMounted(() => {
    fetchBranches();
    fetchCategories();
    // fetchSpecifications();
    fetchPhotos();
    fetchIncluded();
    getData();
    fetchLocationTypes()
    fetchFuelPolicies()
});
</script>
