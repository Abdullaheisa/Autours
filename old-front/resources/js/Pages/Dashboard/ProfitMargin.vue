<template>
    <div class="card">
        <div class="card-body">
            <h2 class="mb-4">Profit Margins</h2>
            <div class="card">
                <div class="card-body">
                    <div class="">
                        <form @submit.prevent="upload">
                            <div class="row ">
                                <div class="formbold-mb-3 col-md-2">
                                    <label class="formbold-form-label">Country</label>
                                    <el-select
                                        v-model="country"
                                        size="large"
                                        filterable
                                        clearable
                                        placeholder="Countries..."
                                        :loading="countries.loading.value"
                                        v-on:change="handleCountryChange"
                                        required>
                                        <el-option
                                            v-for="item in countries.list.value"
                                            :key="item.id"
                                            :label="item.label"
                                            :value="item.label"
                                        />
                                    </el-select>
                                </div>
                                <div class="formbold-mb-3 col-md-2">
                                    <label class="formbold-form-label">Suppliers</label>
                                    <el-select
                                        v-model="supplier"
                                        size="large"
                                        filterable
                                        clearable
                                        placeholder="Suppliers..."
                                        :loading="suppliers.loading.value"
                                        v-on:change="handleSupplierChange"
                                        required>
                                        <el-option
                                            v-for="item in suppliers.list.value"
                                            :key="item.id"
                                            :label="item.label"
                                            :value="item.id"
                                        />
                                    </el-select>
                                </div>
                                <div class="formbold-mb-3 col-md-2">
                                    <label class="formbold-form-label">Branches</label>
                                    <el-select
                                        v-model="branch"
                                        size="large"
                                        filterable
                                        clearable
                                        placeholder="Branches..."
                                        :loading="branches.loading.value"
                                        v-on:change="handleBranchChange"
                                        required>
                                        <el-option
                                            v-for="item in branches.list.value"
                                            :key="item.id"
                                            :label="item.label"
                                            :value="item.id"
                                        />
                                    </el-select>
                                </div>
                                <div class="formbold-mb-3 col-md-2">
                                    <label class="formbold-form-label">Vehicles</label>
                                    <el-select
                                        v-model="selectedVehicles"
                                        size="large"
                                        filterable
                                        clearable
                                        multiple
                                        placeholder="Vehicles..."
                                        :loading="vehicles.loading.value"
                                        required>
                                        <el-option
                                            v-for="item in vehicles.list.value"
                                            :key="item.id"
                                            :label="item.label"
                                            :value="item.id"
                                        >
                                            <div class="d-flex" style="gap:10px;">
                                                <img :src="'img/vehicles/' + item.photo" style="width:50px;">
                                                {{ item.label }}
                                            </div>
                                        </el-option>
                                    </el-select>
                                </div>
                                <div class="mt-4 col-md-1">
                                    <button class="mt-2 btn btn-primary col-md-12" type="button" @click="getUserData(1)">Search</button>
                                </div>
                            </div>
                            <hr/>
                            <h4>Profit Percentage</h4>
                            <div class="row mt-5">
                                <div class="formbold-mb-3 col-md-2">
                                    <label class="formbold-form-label ">1-2 Day</label>
                                    <div class="input-with-percent">
                                        <input v-model="priceTax" type="text" pattern="[0-9]+([,.][0-9]+)?"
                                               class="formbold-form-input "/>
                                        <span class="percent-symbol">%</span>
                                    </div>
                                </div>
                                <div class="formbold-mb-3 col-md-2">
                                    <label class="formbold-form-label">3 - 7 Days</label>
                                    <div class="input-with-percent">
                                        <input v-model="weekPriceTax" type="text" pattern="[0-9]+([,.][0-9]+)?"
                                               class="formbold-form-input "/>
                                        <span class="percent-symbol">%</span>
                                    </div>
                                </div>

                                <div class="formbold-mb-3 col-md-2">
                                    <label class="formbold-form-label">8-30 Days</label>
                                    <div class="input-with-percent">
                                        <input v-model="monthPriceTax" type="text" pattern="[0-9]+([,.][0-9]+)?"
                                               class="formbold-form-input "/>
                                        <span class="percent-symbol">%</span>
                                    </div>
                                </div>
                                <div class="formbold-mb-3 col-md-2">
                                    <label class="formbold-form-label">Weekend</label>
                                    <div class="input-with-percent">
                                        <input v-model="weekendPriceTax" type="text" pattern="[0-9]+([,.][0-9]+)?"
                                               class="formbold-form-input "/>
                                        <span class="percent-symbol">%</span>
                                    </div>
                                </div>
                                <div class="text-center">
                                    <button type="submit" class="formbold-btn">Submit</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <div class="card">
                <div class="card-body">
                    <el-table :data="tableData" style="width: 100%" :loading="loading" stripe>

                        <el-table-column label="Photo" prop="">
                            <template #default="scope">
                                <img :src="'/img/vehicles/' + scope.row.photo" width="150" height="100">
                            </template>
                        </el-table-column>
                        <el-table-column label="Vehicle Name" prop="vehicle_name"/>
                        <el-table-column label="Country" prop="branch_country"/>
                        <el-table-column label="Branch Name" prop="branch_name"/>
                        <el-table-column label="1-2 days Price" prop="per_day_profit">
                            <template #default="scope">
                                <el-input class=" col-6" v-model="tableData[scope.$index].per_day_profit"
                                          :value="scope.row.per_day_profit" placeholder="1-2 price"/>
                                %
                            </template>
                        </el-table-column>
                        <el-table-column label="3-7 days Price" prop="per_week_profit">
                            <template #default="scope">
                                <el-input class=" col-6" v-model="tableData[scope.$index].per_week_profit"
                                          :value="scope.row.per_week_profit" placeholder="3-7 price"/>
                                %
                            </template>
                        </el-table-column>
                        <el-table-column label="4-30 days Price" prop="per_month_profit">
                            <template #default="scope">
                                <el-input class=" col-6" v-model="tableData[scope.$index].per_month_profit"
                                          :value="scope.row.per_month_profit" placeholder="4-30 price"/>
                                %
                            </template>
                        </el-table-column>
                        <el-table-column label="weekend Price" prop="per_month_profit">
                            <template #default="scope">
                                <el-input class=" col-6 " v-model="tableData[scope.$index].weekend_profit"
                                          :value="scope.row.weekend_profit" placeholder="4-30 price"/>
                                %
                            </template>
                        </el-table-column>

                        <el-table-column label="Actions">
                            <template #default="scope">
                                <button class="btn"><i style="color:green;" @click="updateSingleVehicle(scope.$index)"
                                                       class="fa fa-check fa-2x"/></button>
                            </template>
                            <template #header>
                                <el-input v-model="search" size="large" placeholder="Type to search" @change="getUserData(1)"/>
                            </template>
                        </el-table-column>

                    </el-table>

                    <div class="d-flex justify-content-end mt-4">
                        <el-pagination
                            v-model:current-page="currentPage"
                            v-model:page-size="pageSize"
                            :page-sizes="[10, 15, 20, 50]"
                            layout="total, sizes, prev, pager, next, jumper"
                            :total="total"
                            @size-change="handleSizeChange"
                            @current-change="handleCurrentChange"
                        />
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

const currentPage = ref(1)
const pageSize = ref(15)
const total = ref(0)

const priceTax = ref('');
const weekPriceTax = ref('');
const monthPriceTax = ref('');
const weekendPriceTax = ref('');
const oldPass = ref('');
const formStatus = ref(true)
const country = ref('')
const supplier = ref('')
const selectedVehicles = ref([])
const branch = ref('')
const countries = {
    loading: ref(false),
    all: ref([]),
    list: ref([]),
    options: ref([]),
};
const suppliers = {
    loading: ref(false),
    all: ref([]),
    list: ref([]),
    options: ref([]),
};
const branches = {
    loading: ref(false),
    all: ref([]),
    list: ref([]),
    options: ref([]),
};
const vehicles = {
    loading: ref(false),
    all: ref([]),
    list: ref([]),
    options: ref([]),
};

const getUserData = async (page = 1) => {
    try {
        loading.value = true
        const params = {
            page: page,
            per_page: pageSize.value,
        };
        if (search.value) params.search = search.value
        if (country.value) params.country = country.value
        if (supplier.value) params.supplier = supplier.value
        if (branch.value) params.branch = branch.value
        if (selectedVehicles.value) params.selectedVehicles = selectedVehicles.value

        const response = await axios.get('/get/profit', {params: params});
        tableData.value = response.data.data
        total.value = response.data.total
        currentPage.value = page
    } catch (error) {
        console.error(error);
    } finally {
        loading.value = false;
    }
}





const upload = async () => {
    const formData = new FormData();
    const $toast = useToast();
    if (priceTax.value && priceTax.value > 0 && !isNaN(priceTax.value)) {
        formData.append('priceTax', priceTax.value);
    } else {
        $toast.error('1-2 days profit is required and should be more than 0', {position: 'top'});
        return
    }
    if (weekPriceTax.value) {
        formData.append('weekPriceTax', weekPriceTax.value);
    } else {
        $toast.error('3-7 days profit is required and should be more than 0', {position: 'top'});
        return
    }
    if (monthPriceTax.value) {
        formData.append('monthPriceTax', monthPriceTax.value);
    } else {
        $toast.error('8 - 30 days profit is required and should be more than 0', {position: 'top'});
        return
    }
    if (weekendPriceTax.value) {
        formData.append('weekendPriceTax', weekendPriceTax.value);
    } else {
        $toast.error('weekend profit is required and should be more than 0', {position: 'top'});
        return
    }
    if (country.value) {
        formData.append('country', country.value);
    } else {
        $toast.error('Please select country', {position: 'top'});
        return
    }
    if (supplier.value) {
        formData.append('supplier', supplier.value);
    }
    if (branch.value) {
        formData.append('branch', branch.value);
    }
    if (selectedVehicles.value.length > 0) {
        formData.append('selectedVehicles', selectedVehicles.value);
    }
    try {
        await axios.post('profit/upload', formData);

        $toast.success('Price List updated',
            {
                position: 'top',
            });


    } catch (error) {
        $toast.error(error.message, {position: 'top'});

    } finally {
        getUserData(currentPage.value);
    }
}

const handleSizeChange = (val) => {
    pageSize.value = val;
    getUserData(1);
}

const handleCurrentChange = (val) => {
    getUserData(val);
}

const fetchCountries = async () => {
    countries.loading.value = true;
    try {
        //
        const response = await axios.get('/get/countries', {})
        countries.all.value = response.data
        console.log(response);
        countries.list.value = countries.all.value.map((item) => ({
            id: `${item}`,
            label: `${item}`,
            iso: `${item}`
        }))
    } catch (error) {
        console.error(error)
    } finally {
        countries.loading.value = false;
    }
}
const updateSingleVehicle = async ($index) => {
    try {
        loading.value = true;
        const formData = new FormData();
        const $toast = useToast();
        if (tableData.value[$index].per_day_profit && !isNaN(tableData.value[$index].per_day_profit) && tableData.value[$index].per_day_profit > 0) {
            formData.append('priceTax', tableData.value[$index].per_day_profit);
        } else {
            $toast.error('1-2 days profit is required and should be more than 0 for ' + tableData.value[$index].vehicle_name, {position: 'top'});
            return
        }
        if (tableData.value[$index].per_week_profit) {
            formData.append('weekPriceTax', tableData.value[$index].per_week_profit);
        } else {
            $toast.error('3-7 days profit is required and should be more than 0 for ' + tableData.value[$index].vehicle_name, {position: 'top'});
            return
        }
        if (tableData.value[$index].per_month_profit) {
            formData.append('monthPriceTax', tableData.value[$index].per_month_profit);
        } else {
            $toast.error('8 - 30 days profit is required and should be more than 0 for ' + tableData.value[$index].vehicle_name, {position: 'top'});
            return
        }
        if (tableData.value[$index].weekend_profit) {
            formData.append('weekendPriceTax', tableData.value[$index].weekend_profit);
        } else {
            $toast.error('weekend profit is required and should be more than 0 for ' + tableData.value[$index].vehicle_name, {position: 'top'});
            return
        }
        formData.append('selectedVehicles', tableData.value[$index].vehicle_id);


        const response = await axios.post('profit/upload', formData);
        $toast.success('Price List updated successfully to ' + tableData.value[$index].vehicle_name, {position: 'top'});

    } catch (error) {
        console.error(error);
    } finally {
        getUserData(currentPage.value);
    }
}
const handleCountryChange = () => {
    supplier.value = '';
    branch.value = '';
    selectedVehicles.value = [];
    suppliers.list.value = [];
    branches.list.value = [];
    vehicles.list.value = [];
    getSuppliers();
}

const getSuppliers = async () => {
    try {
        suppliers.loading.value = true
        if (country.value) {
            const response = await axios.get('get/suppliers', {
                params: {
                    'country': country.value
                }
            })
            suppliers.all.value = response.data
            suppliers.list.value = suppliers.all.value.map((item) => ({
                value: `${item.name}`,
                label: `${item.name}`,
                id: `${item.id}`,
            }))
        } else {
            suppliers.list.value = [];
        }
    } catch (error) {
        console.error(error)
    } finally {
        suppliers.loading.value = false
    }
}

const handleSupplierChange = () => {
    branch.value = '';
    selectedVehicles.value = [];
    branches.list.value = [];
    vehicles.list.value = [];
    getBranches();
}

const getBranches = async () => {
    try {
        branches.loading.value = true
        if (supplier.value) {
            const response = await axios.get('get/branches', {
                params: {
                    'company_id': supplier.value,
                    'country': country.value
                }
            });
            branches.all.value = response.data
            branches.list.value = branches.all.value.map((item) => ({
                value: `${item.name}`,
                label: `${item.name}`,
                id: `${item.id}`,
            }))
        } else {
            branches.list.value = [];
        }
    } catch (error) {
        console.error(error);
    } finally {
        branches.loading.value = false
    }
};

const handleBranchChange = () => {
    selectedVehicles.value = [];
    vehicles.list.value = [];
    getVehicles();
}

const getVehicles = async () => {
    try {
        vehicles.loading.value = true
        if (branch.value) {
            const response = await axios.get('get/vehicles', {
                params: {
                    'branch_id': branch.value,
                    'supplier': supplier.value
                }
            });
            vehicles.all.value = response.data
            vehicles.list.value = vehicles.all.value.map((item) => ({
                value: `${item.name}`,
                label: `${item.name}`,
                id: `${item.id}`,
                photo: `${item.photo}`,
            }))
        } else {
            vehicles.list.value = [];
        }
    } catch (error) {
        console.error(error);
    } finally {
        vehicles.loading.value = false
    }
};
onMounted(() => {
    getUserData(1);
    fetchCountries()
});

</script>
