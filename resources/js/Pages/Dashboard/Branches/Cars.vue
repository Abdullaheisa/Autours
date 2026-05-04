<template>


    <div class="card">
        <div class="card-body">
            <h2 class="mb-4">Assign Cars To Branch</h2>
            <div class=" justify-content-center col-md-12">
                <div v-if="!loading" class="row">



                    <div class="card-body">
                        <el-table :data="vehicleFilterTableData" style="width: 100%" :loading="loading" stripe>
                            <el-table-column label="In Branch" prop="what_is_included">

                                <template #default="scope">
                                    <el-checkbox :value="scope.row.id" @click="selectVehicle(scope.row.vehicle_id)"/>
                                </template>
                            </el-table-column>
                            <el-table-column label="Photo" prop="">
                                <template #default="scope">
                                    <img :src="'/img/vehicles/' + scope.row.photo" width="150" height="100">
                                </template>
                            </el-table-column>
                            <el-table-column label="Vehicle Name" prop="vehicle_name"/>
                            <el-table-column label="Category" prop="category"/>
                        </el-table>

                    </div>




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
const supplier = ref(false)
const selectedVehicles = ref([])

const $toast = useToast()

const states = {
    loading: ref(false),
    all: ref([]),
    list: ref([]),
    options: ref([]),
};
const vehicleTableData = ref([])


const countries = {
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

const selectVehicle = (vehicle) => {
    console.log(vehicle)
    if (selectedVehicles.value?.indexOf(vehicle) >= 0) {
        selectedVehicles.value.splice(selectedVehicles.value.indexOf(vehicle), 1);
    } else {
        selectedVehicles.value.push(vehicle);
    }
    console.log(selectedVehicles.value)
}


const filterTableData = computed(() => {
    if (typeof search.value === 'string')
        return tableData.value.filter((data) => !search.value || data.what_is_included != undefined || data.what_is_included.toLowerCase().includes(search.value.toLowerCase()))
    else search.value = ''
})
const vehicleFilterTableData = computed(() => {

    const dataArray = Array.isArray(vehicleTableData.value) ? vehicleTableData.value : [];

    return dataArray.filter((data) =>
        !search.value
        || (data.vehicle_name && data.vehicle_name.toLowerCase().includes(search.value.toLowerCase()))
    );

})

const cancel = () => {
    router.get('/branches')
}
const getVehiclesData = async () => {
    try {
        loading.value = true

        const response = await axios.get('/get/profit');
        vehicleTableData.value = response.data.data
        supplier.value = response.data.supplier_id

        loading.value = false;

    } catch (error) {
        loading.value = false;

        console.error(error);
    }
}

onMounted(async () => {
        let urlParams = new URLSearchParams(window.location.search);

        if (urlParams.has('id')) {
            id.value = urlParams.get('id')
        }
        await getVehiclesData()
    }
)
</script>
<style>

</style>
