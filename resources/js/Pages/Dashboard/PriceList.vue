<template>
    <div class="card">
        <div class="card-body">
            <h2 class="mb-4">Price List</h2>
            <div class="card">
                <div class="card-body">
                    <div class=" d-flex">
                        <el-table :data="filterTableData" style="width: 100%" :loading="loading" stripe>

                            <el-table-column label="Photo" prop="">
                                <template #default="scope">
                                    <img :src="'/img/vehicles/' + scope.row.photo" width="150" height="100">
                                </template>
                            </el-table-column>
                            <el-table-column label="Name" prop="name"/>
                            <el-table-column label="1-2 days Price" prop="price">
                                <template #default="scope">
                                    <el-input class=" col-6" v-model="tableData[scope.$index].price"
                                              :value="scope.row.price" placeholder="1-2 price"/>{{scope.row.branch.currency}}
                                </template>
                            </el-table-column>
                            <el-table-column label="3-7 days Price" prop="week_price">
                                <template #default="scope">
                                    <el-input class=" col-6" v-model="tableData[scope.$index].week_price"
                                              :value="scope.row.week_price" placeholder="3-7 price"/>{{scope.row.branch.currency}}
                                </template>
                            </el-table-column>
                            <el-table-column label="8-30 days Price" prop="month_price">
                                <template #default="scope">
                                    <el-input class=" col-6" v-model="tableData[scope.$index].month_price"
                                              :value="scope.row.month_price" placeholder="4-30 price"/>{{scope.row.branch.currency}}
                                </template>
                            </el-table-column>

                            <el-table-column label="Branch Name - Location" prop="branch">
                                <template #default="scope">
                                        {{scope.row.branch.name}} - {{scope.row.branch.location}}
                                </template>
                            </el-table-column>

                            <el-table-column label="Actions">
                                <template #default="scope">
                                        <button class="btn" @click="update(scope.row, scope.$index)"><i style="color:green;" class="fa fa-check fa-2x"/></button>
                                        <el-switch size="large" v-model="tableData[scope.$index].activation" :value="scope.row.activation" @click="changeVehicleStatus(scope.row)"></el-switch>
                                </template>
                                <template #header>
                                    <el-input v-model="search" size="large" placeholder="Type to search"/>
                                </template>
                            </el-table-column>

                        </el-table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import {computed, onMounted, ref} from 'vue'

import {useToast} from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';

const loading = ref(false)
const search = ref('')

const tableData = ref([])


const filterTableData = computed(() => {
    const dataArray = Array.isArray(tableData.value) ? tableData.value : [];
    return dataArray.filter((data) =>
        !search.value || data.name.toLowerCase().includes(search.value.toLowerCase())
    );
})

const getData = async (index, row) => {
    try {
        loading.value = true;
        const response = await axios.get('/get/vehicles');
        tableData.value = response.data;
        for (const key in tableData.value[index]) {
            data.value[key] = tableData.value[index][key] || '';
        }

    } catch (error) {
        console.error(error);
    } finally {
        loading.value = false;
    }
}

const update = async ($item, $index) => {
    const $toast = useToast();

    try {
        loading.value = true;
        const formData = new FormData();
        console.log(tableData.value[$index])

        if(tableData.value[$index].price == null || tableData.value[$index].price <= 0 || isNaN(tableData.value[$index].price)) {
            $toast.error('price should be numeric and more than 0', {position: 'top'})
            return
        }
        if(tableData.value[$index].week_price == null || tableData.value[$index].week_price <= 0 || isNaN(tableData.value[$index].week_price)) {
            $toast.error('price should be numeric and more than 0', {position: 'top'})
            return
        }
        if(tableData.value[$index].month_price == null || tableData.value[$index].month_price <= 0 || isNaN(tableData.value[$index].month_price)) {
            $toast.error('price should be numeric and more than 0', {position: 'top'})
            return
        }
        formData.append('id', $item.id);
        formData.append('price', tableData.value[$index].price);
        formData.append('week_price', tableData.value[$index].week_price);
        formData.append('month_price', tableData.value[$index].month_price);


        formData.append('update', '1');
        const response = await axios.post('/edit-vehicle-price', formData);
        $toast.success('Price List updated successfully to ' + $item.name, {position: 'top'});

    } catch (error) {
        $toast.error(error.message, {position: 'top'});

    } finally {
        getData();
    }
}
const open = () => {
    if (formStatus.value === true) {
        ElMessage({
            showClose: true,
            message: 'Updated successfully.',
            type: 'success',
        })
    } else {
        ElMessage.error('Oops, wrong password.')
    }
}
const changeVehicleStatus = async ($item) => {

    loading.value = true;
    const $toast = useToast();

    try {
        const formData = new FormData();
        const activation = $item.activation ? 1 : 0;
        formData.append('activation', activation);
        formData.append('vehicle_id', $item.id);

        const response = await axios.post('update/vehicles/activation', formData);
        $toast.success('Activation Status  updated successfully to ' + $item.name, {position: 'top'});
    } catch (error) {
        $toast.error(error.message, {position: 'top'});
    } finally {
        loading.value = false;
    }
    console.log($value);
}
onMounted(() => {
        getData()
    }
)

</script>
